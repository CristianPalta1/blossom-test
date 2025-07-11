import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  CharactersRepository,
  CharacterFilters,
} from './repositories/characters.repository';
import { Character } from './entities/character.entity';
import {
  ApiResponse,
  ApiCharacter,
  CreateCharacterData,
} from './interfaces/api-response.interface';

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);
  private readonly apiUrl = 'https://rickandmortyapi.com/api/character';

  constructor(
    private readonly httpService: HttpService,
    private readonly repo: CharactersRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(filters?: CharacterFilters): Promise<Character[]> {
    const cacheKey = `characters:${JSON.stringify(filters || {})}`;
    const cached = await this.cacheManager.get<Character[]>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cached;
    }
    const all = await this.repo.findAll(filters);
    const result = all.filter((c) => c.name != null && c.name !== '');
    await this.cacheManager.set(cacheKey, result, 300);
    this.logger.log(`Cache set: ${cacheKey}`);
    return result;
  }

  async findOne(id: number): Promise<Character | null> {
    const cacheKey = `character:${id}`;
    const cached = await this.cacheManager.get<Character>(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cached;
    }
    const character = await this.repo.findOne(id);
    if (character) {
      await this.cacheManager.set(cacheKey, character, 300);
      this.logger.log(`Cache set: ${cacheKey}`);
    }
    return character;
  }

  async testConnection(): Promise<boolean> {
    try {
      const count = await this.repo.count();
      this.logger.log(`Conexión exitosa. Personajes en DB: ${count}`);
      return true;
    } catch (error) {
      this.logger.error('Error de conexión:', error);
      return false;
    }
  }

  async syncFromApi(): Promise<void> {
    console.log('asdasd');
    try {
      this.logger.log('Iniciando sincronización con API externa...');

      let url = this.apiUrl;
      let allCharacters: ApiCharacter[] = [];

      // Obtener todos los personajes de la API paginada
      do {
        const response = await firstValueFrom(
          this.httpService.get<ApiResponse>(url),
        );

        const { results, info } = response.data;
        allCharacters = [...allCharacters, ...results];
        url = info.next ?? '';
      } while (url);

      // Mapear los datos del API al formato de nuestra base de datos
      const charactersToSave: CreateCharacterData[] = allCharacters.map(
        (apiCharacter: ApiCharacter) => ({
          name: apiCharacter.name,
          status: apiCharacter.status,
          species: apiCharacter.species,
          gender: apiCharacter.gender,
          origin: apiCharacter.origin?.name || '',
          location: apiCharacter.location?.name || '',
          image: apiCharacter.image,
          url: apiCharacter.url,
          apiId: apiCharacter.id,
        }),
      );

      console.log('charactersToSave', charactersToSave);

      // Guardar en la base de datos
      await this.repo.createMany(charactersToSave);

      this.logger.log(
        `Sincronización completada: ${charactersToSave.length} personajes`,
      );
    } catch (error) {
      this.logger.error('Error durante la sincronización:', error);
      throw error;
    }
  }

  async getFromApiAndSave(apiId: number): Promise<Character> {
    try {
      // Verificar si ya existe en la base de datos
      const existingCharacter = await this.repo.findByApiId(apiId);
      if (existingCharacter) {
        return existingCharacter;
      }

      // Obtener del API
      const response = await firstValueFrom(
        this.httpService.get<ApiCharacter>(`${this.apiUrl}/${apiId}`),
      );

      const apiCharacter: ApiCharacter = response.data;

      // Preparar datos para guardar
      const characterData: CreateCharacterData = {
        name: apiCharacter.name,
        status: apiCharacter.status,
        species: apiCharacter.species,
        gender: apiCharacter.gender,
        origin: apiCharacter.origin?.name || '',
        location: apiCharacter.location?.name || '',
        image: apiCharacter.image,
        url: apiCharacter.url,
        apiId: apiCharacter.id,
      };

      // Guardar en la base de datos usando upsert
      const newCharacter = await this.repo.upsert(characterData);

      return newCharacter;
    } catch (error) {
      this.logger.error(`Error obteniendo personaje ${apiId}:`, error);
      throw error;
    }
  }

  async seedInitial(): Promise<void> {
    // 1) Sólo página 1
    const { data } = await firstValueFrom(
      this.httpService.get<ApiResponse>(`${this.apiUrl}?page=1`),
    );
    const firstFifteen = data.results.slice(0, 15);

    // 2) Mapea al DTO de creación
    const charactersToSave: CreateCharacterData[] = firstFifteen.map((c) => ({
      name: c.name,
      status: c.status,
      species: c.species,
      gender: c.gender,
      origin: c.origin?.name || '',
      location: c.location?.name || '',
      image: c.image,
      url: c.url,
      apiId: c.id,
    }));

    // 3) Inserta en BD
    await this.repo.createMany(charactersToSave);
    this.logger.log(`Seed completed: ${charactersToSave.length} characters`);
  }

  async count(filters?: CharacterFilters): Promise<number> {
    return this.repo.count(filters);
  }
}

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

/**
 * @Injectable Marca la clase como un proveedor que puede ser inyectado en otros componentes.
 * Contiene la lógica de negocio para gestionar los personajes.
 */
@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);
  private readonly apiUrl = 'https://rickandmortyapi.com/api/character';

  constructor(
    private readonly httpService: HttpService, // Cliente HTTP para hacer peticiones a la API externa.
    private readonly repo: CharactersRepository, // Repositorio para interactuar con la base de datos.
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, // Gestor de caché (Redis).
  ) {}

  /**
   * Busca y devuelve todos los personajes que coincidan con los filtros, usando caché.
   * @param {CharacterFilters} [filters] - Objeto con los filtros a aplicar.
   * @returns {Promise<Character[]>} Un array de personajes.
   */
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

  /**
   * Busca un personaje por su ID de base de datos, usando caché.
   * @param {number} id - El ID del personaje.
   * @returns {Promise<Character | null>} El personaje encontrado or `null`.
   */
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

  /**
   * Verifica la conexión con la base de datos contando los registros.
   * @returns {Promise<boolean>} `true` si la conexión es exitosa.
   */
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

  /**
   * Sincroniza todos los personajes desde la API de Rick and Morty.
   * Obtiene todos los personajes paginados y los guarda en la base de datos local.
   */
  async syncFromApi(): Promise<void> {
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

  /**
   * Obtiene un personaje de la API por su ID y lo guarda en la base de datos.
   * Si el personaje ya existe, lo devuelve sin hacer la petición a la API.
   * @param {number} apiId - El ID del personaje en la API externa.
   * @returns {Promise<Character>} El personaje guardado o encontrado.
   */
  async getFromApiAndSave(apiId: number): Promise<Character> {
    try {
      const existingCharacter = await this.repo.findByApiId(apiId);
      if (existingCharacter) {
        return existingCharacter;
      }

      const response = await firstValueFrom(
        this.httpService.get<ApiCharacter>(`${this.apiUrl}/${apiId}`),
      );

      const apiCharacter: ApiCharacter = response.data;

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

      const newCharacter = await this.repo.upsert(characterData);

      return newCharacter;
    } catch (error) {
      this.logger.error(`Error obteniendo personaje ${apiId}:`, error);
      throw error;
    }
  }

  /**
   * Popula la base de datos con los primeros 15 personajes de la API.
   * Utilizado para la configuración inicial (seeding).
   */
  async seedInitial(): Promise<void> {
    const { data } = await firstValueFrom(
      this.httpService.get<ApiResponse>(`${this.apiUrl}?page=1`),
    );
    const firstFifteen = data.results.slice(0, 15);

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

    await this.repo.createMany(charactersToSave);
    this.logger.log(`Seed completed: ${charactersToSave.length} characters`);
  }

  /**
   * Cuenta el número total de personajes que coinciden con los filtros.
   * @param {CharacterFilters} [filters] - Objeto con los filtros a aplicar.
   * @returns {Promise<number>} El número total de personajes.
   */
  async count(filters?: CharacterFilters): Promise<number> {
    return this.repo.count(filters);
  }
}
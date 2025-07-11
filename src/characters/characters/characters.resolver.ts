import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { CharacterFilters } from './repositories/characters.repository';

/**
 * @Resolver Decorator que marca la clase como un resolvedor de GraphQL para la entidad `Character`.
 * Maneja las consultas y mutaciones relacionadas con los personajes.
 */
@Resolver(() => Character)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

  /**
   * @Query Devuelve una lista de personajes.
   * Permite filtrar los resultados por nombre, estado, especie, género y ubicación.
   * @param {string} [name] - Nombre del personaje a buscar.
   * @param {string} [status] - Estado del personaje (e.g., 'Alive', 'Dead').
   * @param {string} [species] - Especie del personaje.
   * @param {string} [gender] - Género del personaje.
   * @param {string} [location] - Ubicación actual del personaje.
   * @returns {Promise<Character[]>} Una promesa que resuelve a un array de personajes.
   */
  @Query(() => [Character], { name: 'characters' })
  async findAll(
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('species', { type: () => String, nullable: true }) species?: string,
    @Args('gender', { type: () => String, nullable: true }) gender?: string,
    @Args('location', { type: () => String, nullable: true }) location?: string,
  ): Promise<Character[]> {
    const filters: CharacterFilters = {};

    if (name) filters.name = name;
    if (status) filters.status = status;
    if (species) filters.species = species;
    if (gender) filters.gender = gender;
    if (location) filters.location = location;

    return this.charactersService.findAll(filters);
  }

  /**
   * @Query Busca y devuelve un único personaje por su ID de base de datos.
   * @param {number} id - El ID del personaje a buscar.
   * @returns {Promise<Character | null>} Una promesa que resuelve al personaje encontrado o `null` si no existe.
   */
  @Query(() => Character, { name: 'character', nullable: true })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Character | null> {
    return this.charactersService.findOne(id);
  }

  /**
   * @Query Cuenta el número total de personajes que coinciden con los filtros proporcionados.
   * @param {string} [name] - Nombre del personaje.
   * @param {string} [status] - Estado del personaje.
   * @param {string} [species] - Especie del personaje.
   * @param {string} [gender] - Género del personaje.
   * @param {string} [origin] - Origen del personaje.
   * @param {string} [location] - Ubicación del personaje.
   * @returns {Promise<number>} Una promesa que resuelve al número total de personajes.
   */
  @Query(() => Int, { name: 'charactersCount' })
  async count(
    @Args('name', { type: () => String, nullable: true }) name?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('species', { type: () => String, nullable: true }) species?: string,
    @Args('gender', { type: () => String, nullable: true }) gender?: string,
    @Args('origin', { type: () => String, nullable: true }) origin?: string,
    @Args('location', { type: () => String, nullable: true }) location?: string,
  ): Promise<number> {
    const filters: CharacterFilters = {};

    if (name) filters.name = name;
    if (status) filters.status = status;
    if (species) filters.species = species;
    if (gender) filters.gender = gender;
    if (origin) filters.origin = origin;
    if (location) filters.location = location;

    return this.charactersService.count(filters);
  }

  /**
   * @Mutation Sincroniza todos los personajes desde la API externa de Rick and Morty
   * hacia la base de datos local. Este proceso puede tardar.
   * @returns {Promise<boolean>} Devuelve `true` si la sincronización se inicia correctamente.
   */
  @Mutation(() => Boolean, { name: 'syncCharacters' })
  async syncCharacters(): Promise<boolean> {
    await this.charactersService.syncFromApi();
    return true;
  }

  /**
   * @Query Realiza una prueba de conexión a la base de datos.
   * @returns {Promise<boolean>} Devuelve `true` si la conexión es exitosa, `false` en caso contrario.
   */
  @Query(() => Boolean, { name: 'testDatabaseConnection' })
  async testConnection(): Promise<boolean> {
    return this.charactersService.testConnection();
  }

  /**
   * @Mutation Obtiene un personaje específico desde la API externa por su ID de API
   * y lo guarda en la base de datos local.
   * @param {number} apiId - El ID del personaje en la API de Rick and Morty.
   * @returns {Promise<Character>} El personaje guardado en la base de datos.
   */
  @Mutation(() => Character, { name: 'getCharacterFromApi' })
  async getFromApi(
    @Args('apiId', { type: () => Int }) apiId: number,
  ): Promise<Character> {
    return this.charactersService.getFromApiAndSave(apiId);
  }
}
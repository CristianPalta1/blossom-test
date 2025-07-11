import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { CharactersService } from './characters.service';
import { Character } from './entities/character.entity';
import { CharacterFilters } from './repositories/characters.repository';

@Resolver(() => Character)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

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

  @Query(() => Character, { name: 'character', nullable: true })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Character | null> {
    return this.charactersService.findOne(id);
  }

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

  @Mutation(() => Boolean, { name: 'syncCharacters' })
  async syncCharacters(): Promise<boolean> {
    await this.charactersService.syncFromApi();
    return true;
  }

  @Mutation(() => Character, { name: 'getCharacterFromApi' })
  async getFromApi(
    @Args('apiId', { type: () => Int }) apiId: number,
  ): Promise<Character> {
    return this.charactersService.getFromApiAndSave(apiId);
  }
}

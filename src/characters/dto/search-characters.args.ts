import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SearchCharactersArgs {
  @Field({ nullable: true, description: 'Filtrar por nombre (parcial)' })
  name?: string;

  @Field({
    nullable: true,
    description: 'Filtrar por estado (alive, dead, unknown)',
  })
  status?: string;

  @Field({
    nullable: true,
    description: 'Filtrar por especie (e.g. Human, Alien)',
  })
  species?: string;

  @Field({
    nullable: true,
    description: 'Filtrar por género (male, female, genderless, unknown)',
  })
  gender?: string;

  @Field({ nullable: true, description: 'Filtrar por origen (nombre parcial)' })
  origin?: string;
}

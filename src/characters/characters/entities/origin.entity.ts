import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Origin {
  @Field()
  name: string;
}

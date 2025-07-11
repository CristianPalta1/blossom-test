import { Optional } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ObjectType, Field, Int } from '@nestjs/graphql';

/**
 * Atributos completos de Character (incluye id)
 */
export interface CharacterAttributes {
  id: number;
  name: string;
  status: string;
  species: string;
  type?: string;
  gender: string;
  image: string;
  origin: string;
}

/**
 * Atributos necesarios para crear un Character (id opcional)
 */
export type CharacterCreationAttrs = Optional<CharacterAttributes, 'id'>;

@ObjectType()
@Table({ tableName: 'characters' })
export class Character extends Model<
  CharacterAttributes,
  CharacterCreationAttrs
> {
  @Field(() => Int)
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Field()
  @Column({ allowNull: false })
  name: string;

  @Field()
  @Column({ allowNull: false })
  status: string;

  @Field()
  @Column({ allowNull: false })
  species: string;

  @Field({ nullable: true })
  @Column
  type?: string;

  @Field()
  @Column({ allowNull: false })
  gender: string;

  @Field()
  @Column({ allowNull: false })
  image: string;

  // Campo de origen como String, con Field explícito
  @Field(() => String)
  @Column({ allowNull: false })
  origin: string;
}

import { Optional } from 'sequelize';
import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ObjectType, Field, Int } from '@nestjs/graphql';

export interface CharacterAttributes {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  image: string;
  origin: string;
  location: string; // ← Agregar este campo
  url: string; // ← Agregar este campo
  apiId: number; // ← Agregar este campo
  createdAt?: Date;
  updatedAt?: Date;
}

export type CharacterCreationAttrs = Optional<
  CharacterAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

@ObjectType()
@Table({
  schema: 'public',
  tableName: 'characters',
  timestamps: true,
})
export class Character extends Model<
  CharacterAttributes,
  CharacterCreationAttrs
> {
  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Field({ nullable: true })
  @Column({ allowNull: true })
  declare name?: string;

  @Field()
  @Column({ allowNull: false })
  declare status: string;

  @Field()
  @Column({ allowNull: false })
  declare species: string;

  @Field()
  @Column({ allowNull: false })
  declare gender: string;

  @Field()
  @Column({ allowNull: false })
  declare image: string;

  @Field()
  @Column({ allowNull: false })
  declare origin: string;

  @Field()
  @Column({ allowNull: false })
  declare location: string;

  @Field()
  @Column({ allowNull: false })
  declare url: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    unique: true,
  })
  declare apiId: number;

  @Field()
  @Column({ allowNull: false })
  declare createdAt: Date;

  @Field()
  @Column({ allowNull: false })
  declare updatedAt: Date;
}

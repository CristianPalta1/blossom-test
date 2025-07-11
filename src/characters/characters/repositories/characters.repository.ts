import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Character } from '../entities/character.entity';
import { Op, WhereOptions } from 'sequelize';

export interface CharacterFilters {
  name?: string;
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  location?: string;
}

@Injectable()
export class CharactersRepository {
  constructor(
    @InjectModel(Character)
    private characterModel: typeof Character,
  ) {}

  async findAll(filters?: CharacterFilters): Promise<Character[]> {
    const where: WhereOptions = {};

    if (filters) {
      if (filters.name) where.name = { [Op.iLike]: `%${filters.name}%` };
      if (filters.status) where.status = filters.status;
      if (filters.species)
        where.species = { [Op.iLike]: `%${filters.species}%` };
      if (filters.gender) where.gender = filters.gender;
      if (filters.origin) where.origin = { [Op.iLike]: `%${filters.origin}%` };
      if (filters.location)
        where.location = { [Op.iLike]: `%${filters.location}%` };
    }

    return this.characterModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Character | null> {
    return this.characterModel.findByPk(id);
  }

  async findByApiId(apiId: number): Promise<Character | null> {
    return this.characterModel.findOne({ where: { apiId } });
  }

  async create(characterData: any): Promise<Character> {
    return this.characterModel.create(characterData);
  }

  async createMany(charactersData: any[]): Promise<Character[]> {
    return this.characterModel.bulkCreate(charactersData, {
      updateOnDuplicate: [
        'name',
        'status',
        'species',
        'gender',
        'origin',
        'location',
        'image',
        'url',
      ],
    });
  }

  async upsert(characterData: any): Promise<Character> {
    const [character, created] =
      await this.characterModel.upsert(characterData);
    return character;
  }

  async update(
    id: number,
    characterData: Partial<Character>,
  ): Promise<Character | null> {
    await this.characterModel.update(characterData, {
      where: { id },
    });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.characterModel.destroy({ where: { id } });
  }

  async count(filters?: CharacterFilters): Promise<number> {
    const whereClause: any = {};

    if (filters) {
      if (filters.name) {
        whereClause.name = { [Op.iLike]: `%${filters.name}%` };
      }
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.species) {
        whereClause.species = { [Op.iLike]: `%${filters.species}%` };
      }
      if (filters.gender) {
        whereClause.gender = filters.gender;
      }
      if (filters.origin) {
        whereClause.origin = { [Op.iLike]: `%${filters.origin}%` };
      }
      if (filters.location) {
        whereClause.location = { [Op.iLike]: `%${filters.location}%` };
      }
    }

    return this.characterModel.count({ where: whereClause });
  }
}

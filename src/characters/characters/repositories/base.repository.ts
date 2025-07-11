import { Model, ModelCtor } from 'sequelize-typescript';
import { WhereOptions } from 'sequelize';
import { NotFoundException } from '@nestjs/common';
import { IRepository } from '../interfaces/repository.interface';

export class BaseRepository<T extends Model> implements IRepository<T> {
  constructor(protected readonly model: ModelCtor<T>) {}

  findAll(filter: WhereOptions = {}): Promise<T[]> {
    return this.model.findAll({ where: filter });
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.model.findByPk(id);
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  create(dto: Partial<T>): Promise<T> {
    return this.model.create(dto as any);
  }

  async update(id: number, dto: Partial<T>): Promise<void> {
    const [affectedCount] = await this.model.update(dto as any, {
      where: { id } as WhereOptions,
    });
    if (affectedCount === 0) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }

  async delete(id: number): Promise<void> {
    const affectedCount = await this.model.destroy({
      where: { id } as WhereOptions,
    });
    if (affectedCount === 0) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
  }
}

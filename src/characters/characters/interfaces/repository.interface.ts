export interface IRepository<T> {
  findAll(filter?: any): Promise<T[]>;
  findOne(id: number): Promise<T>;
  create(dto: any): Promise<T>;
  update(id: number, dto: any): Promise<void>;
  delete(id: number): Promise<void>;
}

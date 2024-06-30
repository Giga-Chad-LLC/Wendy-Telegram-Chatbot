
// TODO: where to prisma.$disconnect()?
export interface IRepository<T> {
  create(data: Omit<T, 'id'> | T): Promise<T>;
  update(id: number, data: Partial<T> | T): Promise<T>;
}

export interface IUpsertableRepository<T> {
  upsert(data: T | Omit<T, 'id'>): Promise<T>;
}

export interface IDeletableRepository<T> {
  delete(id: number): Promise<T | null>;
}

export interface IByIdRetrievableRepository<T> {
  getById(id: number): Promise<T | null>;
}

export interface IByUserIdManyRetrievableRepository<T> {
  getByUserId(id: number): Promise<T[] | null>;
}

export interface IByUserIdUniqueRetrievableRepository<T> {
  getByUserId(id: number): Promise<T | null>;
}

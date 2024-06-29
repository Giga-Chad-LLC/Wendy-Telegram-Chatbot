import { PrismaClient } from '@prisma/client';


// TODO: where to prisma.$disconnect()?
export interface IRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
}

export interface IDeletableRepository<T> {
  delete(id: number): Promise<T | null>;
}

export interface IByIdRetrievableRepository<T> {
  getById(id: number): Promise<T | null>;
}

export interface IByUserIdRetrievableRepository<T> {
  getUserById(id: number): Promise<T[] | null>;
}
import { PrismaClient } from '@prisma/client';

export interface IRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
}

export interface IDeletableRepository<T> {
  delete(id: number): Promise<T | null>;
}

export interface IByUserIdSearchableRepository<T> {
  getUserById(id: number): Promise<T[] | null>;
}
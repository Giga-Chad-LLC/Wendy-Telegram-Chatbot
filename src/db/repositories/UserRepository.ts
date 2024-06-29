import { PrismaClient, User } from '@prisma/client';
import { IByIdRetrievableRepository, IRepository } from './Repositories';


export class UserRepository implements IRepository<User>, IByIdRetrievableRepository<User> {
  private readonly prisma = new PrismaClient();

  create(data: Omit<User, "id">): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  getById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

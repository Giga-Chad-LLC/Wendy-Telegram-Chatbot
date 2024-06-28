import { PrismaClient, User } from '@prisma/client';
import { IByUserIdSearchableRepository, IRepository } from './Repositories';


export class UserRepository implements IRepository<User> {
  private readonly prisma = new PrismaClient();

  create(data: Omit<User, "id">): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}


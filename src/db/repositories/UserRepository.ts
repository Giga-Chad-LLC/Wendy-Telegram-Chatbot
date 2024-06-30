import { PrismaClient, User } from '@prisma/client';
import { IByIdRetrievableRepository, IRepository, IUpsertableRepository } from './Repositories';

export class UserRepository
  implements IUpsertableRepository<User>, IByIdRetrievableRepository<User>
{
  private readonly prisma = new PrismaClient();

  /*create(data: User): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { telegramUserId: id }, data });
  }*/

  getById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { telegramUserId: id } });
  }

  upsert(data: Omit<User, "id"> | User): Promise<User> {
    return this.prisma.user.upsert({
      where: { telegramUserId: data.telegramUserId },
      create: data,
      update: data,
    });
  }
}

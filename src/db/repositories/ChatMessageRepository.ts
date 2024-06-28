import { PrismaClient, ChatMessage } from '@prisma/client';
import { IByUserIdSearchableRepository, IRepository } from './Repositories';



export class ChatMessageRepository implements IRepository<ChatMessage>, IByUserIdSearchableRepository<ChatMessage> {
  private readonly prisma = new PrismaClient();

  create(data: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({ data });
  }

  update(id: number, data: Partial<ChatMessage>): Promise<ChatMessage> {
    return this.prisma.chatMessage.update({ where: { id }, data });
  }

  getUserById(id: number): Promise<ChatMessage[] | null> {
    return this.prisma.chatMessage.findMany({ where: { id } });
  }

  async getFirstSortedBy(field: keyof ChatMessage, ascending: boolean, limit: number): Promise<ChatMessage[]> {
    const sortOrder = ascending ? 'asc' : 'desc';
    return this.prisma.chatMessage.findMany({
      orderBy: {
        [field]: sortOrder,
      },
      take: limit,
    });
  }
}
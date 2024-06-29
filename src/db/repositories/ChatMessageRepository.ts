import { PrismaClient, ChatMessage } from '@prisma/client';
import { IByUserIdRetrievableRepository, IRepository } from './Repositories';


export type PaginatedSortedMessagesParams = {
  userId: number;
  field: keyof ChatMessage;
  ascending: boolean;
  page: number;
  limit: number;
}

export class ChatMessageRepository implements IRepository<ChatMessage>, IByUserIdRetrievableRepository<ChatMessage> {
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

  /**
   * Provides paginated API to retrieve messages of a user with the provided id.
   *
   * @param userId user id whose messages to retrieve
   * @param field field by which to sort
   * @param ascending `true` if ascending sort order, otherwise descending
   * @param page page number <b>starting from 1</b> which should be retrieved
   * @param limit limit of messages to retrieve
   */
  async getPaginatedSortedMessages({
    userId,
    field,
    ascending,
    page,
    limit,
  }: PaginatedSortedMessagesParams): Promise<ChatMessage[]> {
    const sortOrder = ascending ? 'asc' : 'desc';

    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: {
        [field]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }


}
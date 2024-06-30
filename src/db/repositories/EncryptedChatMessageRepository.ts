import { IByUserIdManyRetrievableRepository, IRepository } from './Repositories';
import { ChatMessage } from '@prisma/client';
import { ChatMessageRepository, PaginatedSortedMessagesParams } from './ChatMessageRepository';
import { ISymmetricEncryptor } from '../../app/encription/ISymmetricEncryptor';



export class EncryptedChatMessageRepository extends ChatMessageRepository implements IRepository<ChatMessage>, IByUserIdManyRetrievableRepository<ChatMessage> {
  private readonly chatMessageRepository: ChatMessageRepository;
  private readonly encryptor: ISymmetricEncryptor;

  constructor(chatMessageRepository: ChatMessageRepository, encryptor: ISymmetricEncryptor) {
    super();
    this.chatMessageRepository = chatMessageRepository;
    this.encryptor = encryptor;
  }

  create(data: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    return this.chatMessageRepository.create({
      ...data,
      summary: this.encryptor.encrypt(data.summary),
      text: this.encryptor.encrypt(data.text),
    });
  }

  update(id: number, data: Partial<ChatMessage>): Promise<ChatMessage> {
    const encryptedData = {
      ...data,
      text: data.text ? this.encryptor.encrypt(data.text) : data.text,
      summary: data.summary ? this.encryptor.encrypt(data.summary) : data.summary,
    }
    return this.chatMessageRepository.update(id, encryptedData);
  }

  async getByUserId(id: number): Promise<ChatMessage[] | null> {
    const messages = await this.chatMessageRepository.getByUserId(id);

    return new Promise((resolve, _) => {
      const decryptedMessages = messages ? this.decryptMessages(messages) : null;
      resolve(decryptedMessages);
    })
  }

  async getPaginatedSortedMessages(params: PaginatedSortedMessagesParams): Promise<ChatMessage[]> {
    const messages = await this.chatMessageRepository.getPaginatedSortedMessages(params);
    return new Promise((resolve, _) => resolve(this.decryptMessages(messages)));
  }

  private decryptMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(m => ({
      ...m,
      text: this.encryptor.decrypt(m.text),
      summary: this.encryptor.decrypt(m.summary),
    })) ?? null;
  }
}
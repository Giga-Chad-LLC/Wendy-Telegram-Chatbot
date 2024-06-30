import {
  ColdConversationStartParams,
  ConversationContinuationParams,
  AbstractLlmDialogController, SaveMessageParams, SaveMessageWithRoleParams,
} from './AbstractLlmDialogController';
import { AssistantLlmChatMessage } from '../app/llm/providers/LlmProvider';
import { ChatMessage } from '@prisma/client';
import { ISymmetricEncryptor } from '../app/encription/ISymmetricEncryptor';


export class LlmDialogControllerEncryptionDecorator extends AbstractLlmDialogController {
  private readonly controller: AbstractLlmDialogController;
  private readonly encryptor: ISymmetricEncryptor;

  constructor(controller: AbstractLlmDialogController, encryptor: ISymmetricEncryptor) {
    super();
    this.controller = controller;
    this.encryptor = encryptor;
  }

  async converse(params: ConversationContinuationParams): Promise<AssistantLlmChatMessage> {
    return this.controller.converse(params);
  }

  async converseCold(params: ColdConversationStartParams): Promise<AssistantLlmChatMessage> {
    return this.controller.converseCold(params);
  }

  // const cipheredMessage = this.encryptor.encrypt(message);
  async saveUserMessage(params: SaveMessageParams): Promise<ChatMessage> {
    return this.controller.saveUserMessage(params);
  }

  saveAssistantMessage(params: SaveMessageParams): Promise<ChatMessage> {
    return this.controller.saveAssistantMessage(params);
  }

  saveMessage({ message, ...rest }: SaveMessageWithRoleParams): Promise<ChatMessage> {
    const cipheredMessage = this.encryptor.encrypt(message);
    return this.controller.saveMessage({
      message: cipheredMessage,
      ...rest,
    });
  }

  async summarizeMessage(message: string): Promise<string> {
    const summary = await this.controller.summarizeMessage(message);
    return this.encryptor.encrypt(summary);
  }
}
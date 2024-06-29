import { ChatMessage } from '@prisma/client';
import { sliceArrayInGroupsByK } from '../../../utils/CollectionsUtils';


export type SplitResult = {
  recentMessages: ChatMessage[];
  messagesToSummarize: ChatMessage[];
}

export interface IMessagesSplitPolicy {
  split(messages: ChatMessage[]): SplitResult
}


// implementations

export class MessagesSplitByHalfPolicy implements IMessagesSplitPolicy {
  split(messages: ChatMessage[]): SplitResult {
    const { firstGroup, secondGroup  } = sliceArrayInGroupsByK(
      { items: messages, firstGroupSize: messages.length / 2 });

    return {
      recentMessages: firstGroup,
      messagesToSummarize: secondGroup,
    };
  }
}
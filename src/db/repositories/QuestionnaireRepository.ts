import {
  IByUserIdUniqueRetrievableRepository,
  IRepository,
} from './Repositories';
import { PrismaClient, Questionnaire } from '@prisma/client';

export class QuestionnaireRepository
  implements
    IRepository<Questionnaire>,
    IByUserIdUniqueRetrievableRepository<Questionnaire>
{
  private readonly prisma = new PrismaClient();

  create(data: Questionnaire): Promise<Questionnaire> {
    return this.prisma.questionnaire.create({ data });
  }

  update(id: number, data: Partial<Questionnaire>): Promise<Questionnaire> {
    return this.prisma.questionnaire.update({
      where: { userId: id },
      data,
    });
  }

  upsert(data: Questionnaire): Promise<Questionnaire> {
    return this.prisma.questionnaire.upsert({
      where: { userId: data.userId },
      create: data,
      update: data,
    });
  }

  getByUserId(id: number): Promise<Questionnaire | null> {
    return this.prisma.questionnaire.findUnique({ where: { userId: id } });
  }
}

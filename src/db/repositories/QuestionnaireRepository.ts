import { IByUserIdManyRetrievableRepository, IByUserIdUniqueRetrievableRepository, IRepository } from './Repositories';
import { PrismaClient, Questionnaire } from '@prisma/client';


export class QuestionnaireRepository implements IRepository<Questionnaire>, IByUserIdUniqueRetrievableRepository<Questionnaire> {
  private readonly prisma = new PrismaClient();

  create(data: Omit<Questionnaire, "id">): Promise<Questionnaire> {
    return this.prisma.questionnaire.create({ data });
  }

  update(id: number, data: Partial<Questionnaire>): Promise<Questionnaire> {
    return this.prisma.questionnaire.update({ where: { id }, data });
  }

  getUserById(id: number): Promise<Questionnaire | null> {
    return this.prisma.questionnaire.findUnique({ where: { id } });
  }
}
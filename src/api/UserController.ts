import express from 'express';
import { QuestionnaireRepository } from '../db/repositories/QuestionnaireRepository';
import { body, query, validationResult } from 'express-validator';

export const UserController = express.Router();

const questionnaireRepository = new QuestionnaireRepository();

UserController.post(
  '/questionnaire',
  body('userId').isNumeric(),
  body('preferredName').isString(),
  body('bio').isString(),
  body('bday'),
  body('isAdult').isBoolean(),
  body('residenceCountry').isString(),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json(result);
    }
    const data = req.body;
    await questionnaireRepository.upsert({
      ...data,
      bday: new Date(data.bday),
    });
  },
);

UserController.get(
  '/questionnaire',
  query('userId').isNumeric(),
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.send(result);
    }
    const userId = req.query?.userId;
    const data = await questionnaireRepository.getByUserId(Number(userId));
    if (data) return res.json(data);
    res.status(404).json('User questionnaire not found!');
  },
);

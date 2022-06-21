import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../utils/database';

interface ErrorResponseType {
  error: string;
}

const courses = async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | Record<string, unknown>[]>
): Promise<void> => {
  if (req.method === 'GET') {
    const courses = req.query.courses as string;

    if (!courses) {
      res.status(400).json({ error: 'Nome do curso não preenchido' });
      return;
    }

    const { db } = await connect();

    const response = await db
      .find({ courses: { $in: [new RegExp(`${courses}`, 'i')] } })
      .toArray();

    if (response.length === 0) {
      res.status(400).json({ error: 'Curso não encontrado' });
      return;
    }

    res.status(200).json(response);
  } else {
    res.status(400).json({ error: 'Método request errado' });
  }
};

export default courses;

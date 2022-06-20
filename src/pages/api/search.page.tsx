import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';

interface ErrorResponseType {
  error: string;
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | Record<string, unknown>[]>): Promise<void> => {
  if (req.method === 'GET') {
    const { courses } : { courses: string } = req.body;

    if (!courses) {
      res.status(400).json({error: 'Não encontrado o campo de pesquisa preenchido'});
      return;
    }

    const { db } = await connect();

    const response = await db .find({ courses: { $in: [new RegExp(`^${courses}`, 'i')]}}).toArray();

    if (response.length === 0) {
      res.status(400).json({error: 'Não foi encontrado nenhum professor neste curso.'});
      return;
    }

    res.status(200).json(response);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

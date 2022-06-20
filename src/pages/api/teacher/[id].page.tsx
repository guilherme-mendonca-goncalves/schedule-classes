import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../../utils/database';

interface ErrorResponseType {
  error: string;
}

interface SuccessResponseType {
  _id: string,
	name: string,
	email: string,
	cellphone: string,
	teacher: boolean,
	courses: string[],
	available_hours: Record<string, number[]>,
	available_locations: string[],
	reviews: Record<string, unknown>[],
	appointments: Record<string, unknown>[]
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'GET') {
    const id = req.query.id as string;

    if (!id) {
      res.status(400).json({error: 'Não encontrado o campo ID preenchido'});
      return;
    }

    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      res.status(400).json({ error: 'ObjectID errado' });
      return;
    }

    const { db } = await connect();

    const response = await db.findOne({ _id });

    if (!response) {
      res.status(400).json({error: `Não foi encontrado nenhum professor com o ID ${_id}.`});
      return;
    }

    res.status(200).json(response);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

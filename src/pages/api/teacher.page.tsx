import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';



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
	available_hours: object,
	available_locations: string[],
	reviews: object[],
	appointments: object[]
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'GET') {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({error: 'Não encontrado o campo ID preenchido'});
      return;
    }

    const { db } = await connect();

    const response = await db.collection('users').findOne({'_id': new ObjectId(id)});

    if (!response) {
      res.status(400).json({error: 'Não foi encontrado nenhum professor com este ID.'});
      return;
    }

    res.status(200).json(response);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

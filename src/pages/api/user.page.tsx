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
  if (req.method === 'POST') {
    const {
      name,
      email,
      cellphone,
      teacher,
      courses,
      available_hours,
      available_locations
    } = req.body;

    if (!teacher) {
      if (
        !name ||
        !email ||
        !cellphone
      ) {
        res.status(400).json({error: 'Algum parâmetro está vazio'});
        return;
      }
    } else if (teacher) {
      if (
        !name ||
        !email ||
        !cellphone ||
        !courses ||
        !available_hours ||
        !available_locations
      ) {
        res.status(400).json({error: 'Algum parâmetro está vazio'});
        return;
      }
    }

    const { db } = await connect();

    const response = await db.collection('users').insertOne({
      name,
      email,
      cellphone,
      teacher,
      courses: courses || [],
      available_hours: available_hours || {},
      available_locations: available_locations || [],
      reviews: [],
      appointments: []
    });

    res.status(200).json(response);
  } else if (req.method === 'GET') {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({error: 'Não encontrado o campo e-mail preenchido'});
      return;
    }

    const { db } = await connect();

    const response = await db.collection('users').findOne({email});

    if (!response) {
      res.status(400).json({error: 'Não foi encontrado nenhum usuário com este e-mail.'});
      return;
    }

    res.status(200).json(response);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

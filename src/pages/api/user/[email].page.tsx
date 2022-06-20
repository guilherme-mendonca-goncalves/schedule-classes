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

 const emailPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  // SHOW USER PROFILE
  if (req.method === 'GET') {
    const { email } = req.query;

    if (!email) {
      res.status(400).json({error: 'Não encontrado o campo e-mail preenchido'});
      return;
    }

    const { db } = await connect();

    const response = await db.findOne({email});

    if (!response) {
      res.status(400).json({error: `Não foi encontrado nenhum usuário com o e-mail ${email}.`});
      return;
    }

    res.status(200).json(response);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default emailPage;

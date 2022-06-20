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
	available_hours: Record<string, number[]>,
	available_locations: string[],
	reviews: Record<string, unknown>[],
	appointments: Record<string, unknown>[]
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'POST') {
    // CREATE USER
    const {
      name,
      email,
      cellphone,
      teacher,
      courses,
      available_locations,
      available_hours
    }: {
      name: string;
      email: string;
      cellphone: string;
      teacher: boolean;
      courses: string[];
      available_locations: string[];
      available_hours: Record<string, number[]>;
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

    const lowerCaseEmail = email.toLowerCase();
    const emailAlreadyExists = await db.findOne({ email: lowerCaseEmail });
    if (emailAlreadyExists) {
      res
        .status(400)
        .json({ error: `E-mail ${lowerCaseEmail} already exists` });
      return;
    }

    const response = await db.insertOne({
      name,
      email: lowerCaseEmail,
      cellphone,
      teacher,
      courses: courses || [],
      available_hours: available_hours || {},
      available_locations: available_locations || [],
      reviews: [],
      appointments: []
    });

    res.status(200).json(response);
  }
  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

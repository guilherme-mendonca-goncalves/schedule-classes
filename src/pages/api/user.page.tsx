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
	available_hours: IAvailableHours,
	available_locations: string[],
	reviews: Record<string, unknown>[],
	appointments: Record<string, unknown>[]
}

interface IAvailableHours {
  monday: number[];
  tuesday: number[];
  wednesday: number[];
  thursday: number[];
  friday: number[];
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
      available_hours: IAvailableHours;
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
      // check if available hours is between 7:00 and 20:00
    let invalidHour = false;
    for (const dayOfTheWeek in available_hours) {
      available_hours[dayOfTheWeek].forEach((hour) => {
        if (hour < 7 || hour > 20) {
          invalidHour = true;
          return;
        }
      });
    }
    if (invalidHour) {
      res.status(400).json({ error: 'Você não pode lecionar das 21:00 and 6:00' });
      return;
    }
      if (
        !name ||
        !email ||
        !cellphone ||
        !teacher ||
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
        .json({ error: `E-mail ${lowerCaseEmail} já existe` });
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

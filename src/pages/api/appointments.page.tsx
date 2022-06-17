import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';
import { getSession } from 'next-auth/react';

interface ErrorResponseType {
  error: string;
}

interface SuccessResponseType {
  date: string,
  teacher_name: string,
  teacher_id: string,
  student_name: string,
  student_id: string,
  course: string,
  location: string,
  appointments_link: string
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    if (!session) {
      // Not Signed in
      res.status(400).json({error: 'Faça o login primeiro.'});
      return;
    }

    const {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointments_link
    } = req.body;

    if (
        !date ||
        !teacher_name ||
        !teacher_id ||
        !student_name ||
        !student_id ||
        !course ||
        !location
      ) {
      res.status(400).json({error: 'Algum parâmetro está vazio'});
      return;
    }

    const { db } = await connect();

    const teacherExists = await db.collection('users').findOne({'_id': new ObjectId(teacher_id)});

    if (!teacherExists) {
      res.status(400).json({error: `O professor ${teacher_name} com o ID: ${teacher_id} não existe.`});
      return;
    }

    const studentExists = await db.collection('users').findOne({'_id': new ObjectId(student_id)});

    if (!studentExists) {
      res.status(400).json({error: `O aluno ${student_name} com o ID: ${student_id} não existe.`});
      return;
    }

    const appointment = {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointments_link: appointments_link || ''
    };

    await db.collection('users').updateOne({_id: new ObjectId(teacher_id)}, {$push: {appointments: appointment}});

    await db.collection('users').updateOne({_id: new ObjectId(student_id)}, {$push: {appointments: appointment}});

    res.status(200).json(appointment);
  }

  else {
    res.status(400).json({error: 'ERROR'});
  }
};

export default userPage;

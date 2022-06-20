import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import connect from '../../utils/database';
import { getSession } from 'next-auth/react';

interface User {
  name: string;
  email: string;
  cellphone: string;
  teacher: boolean;
  coins: number;
  courses: string[];
  available_hours: Record<string, number[]>;
  available_locations: string[];
  reviews: Record<string, unknown>[];
  appointments: {
    date: string;
  }[];
  _id: string;
}

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
  appointment_link: string
}

 const userPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'POST') {
    /*const session = await getSession({ req });

    if (!session) {
      // Not Signed in
      res.status(400).json({error: 'Faça o login primeiro.'});
      return;
    }*/

    const {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link
    } : {
      date: string;
      teacher_name: string;
      teacher_id: string;
      student_name: string;
      student_id: string;
      course: string;
      location: string;
      appointment_link: string;
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

     // check if teacher_id or student_id is invalid
     try {
      const testTeacherID = new ObjectId(teacher_id);
      const testStudentID = new ObjectId(student_id);
    } catch {
      res.status(400).json({ error: 'Wrong objectID' });
      return;
    }

    const parsedDate = new Date(date);
    const now = new Date();
    const today = {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    };
    const fullDate = {
      day: parsedDate.getDate(),
      month: parsedDate.getMonth(),
      year: parsedDate.getFullYear(),
    };

    // check if requested date is on the past
    if (
      fullDate.year < today.year ||
      fullDate.month < today.month ||
      fullDate.day < today.day
    ) {
      res.status(400).json({
        error: 'You can\'t create appointments on the past',
      });
      return;
    }

    const { db } = await connect();

    // check if teacher exists
    const teacherExists: User = await db.findOne({_id: new ObjectId(teacher_id)});

    if (!teacherExists) {
      res.status(400).json({error: `O professor ${teacher_name} com o ID: ${teacher_id} não existe.`});
      return;
    }

    // check if student exists
    const studentExists: User = await db.findOne({_id: new ObjectId(student_id)});

    if (!studentExists) {
      res.status(400).json({error: `O aluno ${student_name} com o ID: ${student_id} não existe.`});
      return;
    }

     // check if requested day/hour is available for the teacher
     const weekdays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const requestedDay = weekdays[parsedDate.getDay()];
    const requestedHour = parsedDate.getUTCHours() - 3;
    if (!teacherExists.available_hours[requestedDay]?.includes(requestedHour)) {
      res.status(400).json({
        error: `Teacher ${teacher_name} is not available at ${requestedDay} ${requestedHour}:00`,
      });
      return;
    }

    // check if teacher already have an appointment on the requested day of the month
    teacherExists.appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);

      if (appointmentDate.getTime() === parsedDate.getTime()) {
        res.status(400).json({
          error: `Teacher ${teacher_name} already have an appointment at ${appointmentDate.getDate()}/${
            appointmentDate.getMonth() + 1
          }/${appointmentDate.getFullYear()} ${
            appointmentDate.getUTCHours() - 3
          }:00`,
        });
        return;
      }
    });

    // create appointment object
    const appointment = {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link: appointment_link || ''
    };

    // update teacher appointments
    await db.updateOne({ _id: new ObjectId(teacher_id) },{ $push: { appointments: appointment }});

    // update student appointments
    await db.updateOne({ _id: new ObjectId(student_id) },{ $push: { appointments: appointment }});
  };
};
export default userPage;

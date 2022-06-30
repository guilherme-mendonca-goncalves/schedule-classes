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
  date: string;
  teacher_name: string;
  teacher_id: string;
  student_name: string;
  student_id: string;
  course: string;
  location: string;
  appointment_link: string;
}

 const appointmentsPage = async (req: NextApiRequest, res:NextApiResponse<ErrorResponseType | SuccessResponseType>): Promise<void> => {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    if (!session) {
      res.status(400).json({ error: 'Por favor faça o login primeiro' });
      return;
    }

    const {
      date,
      teacher_id,
      student_email,
      course,
      location,
      appointment_link,
    }: {
      date: string;
      teacher_id: string;
      student_email: string;
      course: string;
      location: string;
      appointment_link: string;
    } = req.body;

    if (session.user.email !== student_email) {
      res
        .status(400)
        .json({ error: 'Utilize o mesmo e-mail da sessão e tente novamente' });
      return;
    }

    if (!date || !teacher_id || !student_email || !course || !location) {
      res.status(400).json({ error: 'Alguma informação não foi preenchida' });
      return;
    }

    // check if teacher_id is invalid
    let testTeacherID: ObjectId;
    try {
      testTeacherID = new ObjectId(teacher_id);
    } catch {
      res.status(400).json({ error: 'ObjectID errado' });
      return;
    }

    const parsedDate = new Date(date);
    const now = new Date();
    const auxParsedDate = new Date(date);

    // check if requested date is on the past
    if (auxParsedDate.setHours(0, 0, 0, 0) <= now.setHours(0, 0, 0, 0)) {
      res.status(400).json({
        error: 'Você não pode agendar aulas em datas passadas',
      });
      return;
    }

    const { db } = await connect();

    // check if teacher exists
    const teacherExists: User = await db.findOne({
      _id: testTeacherID,
    });

    if (!teacherExists) {
      res.status(400).json({
        error: `O professor ${teacherExists.name} com ID ${teacher_id} não existe`,
      });
      return;
    }

    // check if student exists
    const studentExists: User = await db.findOne({
      email: student_email,
    });

    if (!studentExists) {
      res.status(400).json({
        error: `O estudante com o e-mail ${student_email} não existe`,
      });
      return;
    }

    // check if teacher and student are the same person
    if (student_email === teacherExists.email) {
      res
        .status(400)
        .json({ error: 'Você não pode agendar uma aula com você mesmo' });
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
        error: `O professor ${teacherExists.name} não esta disponível em ${requestedDay} ${requestedHour}:00`,
      });
      return;
    }

    // check if teacher already have an appointment on the requested day of the month
    teacherExists.appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);

      if (appointmentDate.getTime() === parsedDate.getTime()) {
        res.status(400).json({
          error: `O professor ${
            teacherExists.name
          } já possui uma aula agendade em ${appointmentDate.getDate()}/${
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
      teacher_name: teacherExists.name,
      teacher_email: teacherExists.email,
      teacher_id,
      student_name: studentExists.name,
      student_id: studentExists._id,
      course,
      location,
      appointment_link: appointment_link || '',
    };

    // update teacher appointments
    await db.updateOne(
      { _id: new ObjectId(teacher_id) },
      { $push: { appointments: appointment } }
    );

    // update student appointments
    await db.updateOne(
      { _id: new ObjectId(studentExists._id) },
      { $push: { appointments: appointment } }
    );

    res.status(200).json(appointment);
  } else {
    res.status(400).json({ error: 'Wrong request method' });
  }
};
export default appointmentsPage;

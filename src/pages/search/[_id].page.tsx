import {GetServerSideProps, GetServerSidePropsContext} from 'next';
import getaxios from '../../utils/getaxios';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  cellphone: string;
  teacher: boolean;
  courses: string[];
  available_hours: Record<string, number[]>;
  available_locations: string[];
  reviews: Record<string, unknown>[];
  appointments: Record<string, unknown>[];
}

const teacherProfilePage = ({name, email, _id}: Teacher) : JSX.Element => {
  return (
    <>
      <h2>Página do Professor {name}</h2>
      <h3>E-mail: {email}</h3>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const _id = context.query._id as string;

  const response = await getaxios<Teacher>(`http://localhost:3000/api/teacher/${_id}`);

  const teacher = response.data;

  return {
    props: teacher,
  };
};

export default teacherProfilePage;

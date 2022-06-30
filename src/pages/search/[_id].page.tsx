import {GetServerSideProps, GetServerSidePropsContext} from 'next';
import { useState, useCallback } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';

import Nav from '../../components/nav';
import getaxios from '../../utils/getaxios';
import 'react-datepicker/dist/react-datepicker.css';

interface Teacher {
  _id: string;
  name: string;
  email: string;
  cellphone: string;
  teacher: boolean;
  coins: number;
  courses: string[];
  available_hours: Record<string, number[]>;
  available_locations: string[];
  reviews: Record<string, unknown>[];
  appointments: Record<string, unknown>[];
}

const weekDayNumber = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const weekdays = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const TeacherProfilePage = ({
  _id,
  name,
  email,
  courses,
  available_hours,
  available_locations,
  cellphone,
  appointments}: Teacher) : JSX.Element => {


  const options = [
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' }
  ];

  const [isScheduling, setIsScheduling] = useState(false);

  const onChangeSelect = (value: any) => {
    let selected = value.value;
    if (selected === 'yes') {
      setIsScheduling(true);
    } else if (selected === 'no') {
      setIsScheduling(false);
    }
  };

  const { data: session, status: loading } = useSession();

  const [location, setLocation] = useState(null);
  const [appointmentLink, setAppointmentLink] = useState(null);
  const [course, setCourse] = useState(null);
  const [date, setDate] = useState(() => {
    const validDaysNumber: number[] = [];

    for (const dayOfTheWeek in available_hours) {
      validDaysNumber.push(weekDayNumber[dayOfTheWeek]);
    }
    const minDay = Math.min(...validDaysNumber);

    const d = new Date();
    d.setDate(d.getDate() + ((((7 - d.getDay()) % 7) + minDay) % 7));

    const date = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      available_hours[weekdays[minDay]][0],
      0,
      0
    );

    return date;
  });

  const [allDates] = useState(() => {
    const StartDate = new Date();
    const EndDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

    const oneDay = 1000 * 60 * 60 * 24;

    const start = Date.UTC(
      EndDate.getFullYear(),
      EndDate.getMonth(),
      EndDate.getDate()
    );
    const end = Date.UTC(
      StartDate.getFullYear(),
      StartDate.getMonth(),
      StartDate.getDate()
    );

    const daysBetween = (start - end) / oneDay;

    const validDaysNumber: number[] = [];
    for (const dayOfTheWeek in available_hours) {
      validDaysNumber.push(weekDayNumber[dayOfTheWeek]);
    }

    const invalidDates: Date[] = [];
    const validDates: Date[] = [];
    invalidDates.push(new Date());
    const loopDate = StartDate;
    for (let i = 0; i < daysBetween; ++i) {
      const aux = loopDate.setDate(loopDate.getDate() + 1);

      if (!validDaysNumber.includes(loopDate.getDay())) {
        invalidDates.push(new Date(aux));
      } else {
        validDates.push(new Date(aux));
      }
    }

    return { validDates, invalidDates };
  });

  const [validHours] = useState(() => {
    const validHours: Date[] = [];

    allDates.validDates.forEach((validDate) => {
      const copyValidDate = validDate;

      const validDateDayNumber = copyValidDate.getDay();
      const validDateDay = weekdays[validDateDayNumber];
      const availableHours = available_hours[validDateDay];
      if (availableHours) {
        let i = 0;
        while (i < 24) {
          if (availableHours.includes(i)) {
            validHours.push(
              new Date(
                copyValidDate.getFullYear(),
                copyValidDate.getMonth(),
                copyValidDate.getDate(),
                i,
                0,
                0
              )
            );
          }
          i++;
        }
      }
    });
    return validHours;
  });

  const handleSubmit = useCallback(async () => {
    const data = {
      date,
      teacher_id: _id,
      student_email: session?.user?.email || null,
      course,
      location,
      appointment_link: appointmentLink || '',
    };

    try {
      await axios.post(process.env.NEXT_PUBLIC_URL + '/api/appointments', data);
      alert('Aula marcada com sucesso!');
    } catch (err) {
      alert(err?.response?.data?.error || err);
    }
  }, [session, course, location, date, appointmentLink]);

  const handleDateSelect = useCallback(
    (event: Date) => {
      setDate(event);
    },
    [setDate]
  );

  return (
    <>
      <Nav />
      <div>
        <p>
          {name}
        </p>
        <h1>E-mail: {email}</h1>
        <h1>Telefone: {cellphone}</h1>

        <div>
          <div>
            <div>
              <p>Disciplinas:</p>
              <div>
                <div>
                  <p>{courses.join(', ')}</p>
                </div>
              </div>
            </div>

            <div>
              <p>Locais:</p>
              <div>
                <div>
                  <p>{available_locations.join(', ')}</p>
                </div>
              </div>
            </div>

            <div>
              <p>Horários:</p>
              <div>
                <div>
                  <p>Segunda</p>
                </div>
                <div>
                  <p>
                    {available_hours?.monday?.join(', ') || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div>
                <div>
                  <p>Terça</p>
                </div>
                <div>
                  <p>
                    {available_hours?.tuesday?.join(', ') || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div>
                <div>
                  <p>Quarta</p>
                </div>
                <div>
                  <p>
                    {available_hours?.wednesday?.join(', ') || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div>
                <div>
                  <p>Quinta</p>
                </div>
                <div>
                  <p>
                    {available_hours?.thursday?.join(', ') || 'Não disponível'}
                  </p>
                </div>
              </div>

              <div>
                <div>
                  <p>Sexta</p>
                </div>
                <div>
                  <p>
                    {available_hours?.friday?.join(', ') || 'Não disponível'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {session ? (
          <>
            Deseja agendar uma aula?
            <Select defaultValue={options[1]} options={options} onChange={onChangeSelect} isSearchable={false}/>
            {isScheduling && (
              <>
            <h1>Escolha o dia e o horário:</h1>
            <DatePicker
              showTimeSelect
              dateFormat="dd/MM/yyyy - h:mm aa"
              selected={date}
              onChange={handleDateSelect} //when day is clicked
              minDate={new Date()}
              maxDate={new Date().setMonth(new Date().getMonth() + 1)}
              includeDates={validHours}
              includeTimes={validHours}
              timeIntervals={60}
              locale={ptBR}
            />
            <div>
              <h1>
                Você quer aula de qual matéria??
              </h1>
              {courses.map((courseMap) => (
                <button
                  key={courseMap}
                  onClick={() => setCourse(courseMap)}
                >
                  {courseMap}
                </button>
              ))}
              <h1>E em qual localização?</h1>
              {available_locations.map((locationMap) => (
                <button
                  key={locationMap}
                  onClick={() => setLocation(locationMap)}
                >
                  {locationMap}
                </button>
              ))}
              {location === 'remoto' || location === 'Remoto' && (
                <>
                  <h1>
                    Favor colocar o link da reunião aqui:
                  </h1>
                  <div>
                    <input
                      type="text"
                      value={appointmentLink!}
                      onChange={(e) => setAppointmentLink(e.target.value)}
                      placeholder="Ex: skype.com/link"
                    />
                  </div>
                  <br />
                </>
              )}
              <div>
                <Link href={'/profile'}>
                  <button onClick={handleSubmit} type="submit">
                    Confirmar agendamento
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
    </>
        ) : (
          <h1>
            Faça login para agendar uma aula com {name}
          </h1>
        )}
      </div>
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

export default TeacherProfilePage;

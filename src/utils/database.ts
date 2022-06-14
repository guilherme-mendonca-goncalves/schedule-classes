import { Db, MongoClient } from 'mongodb';

interface ConnectType {
  db: Db;
  client: MongoClient;
}

const client = new MongoClient(process.env.DATABASE_URL!);

/* VERIFICAR
  const client = new MongoClient(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
*/

const connect = async (): Promise <ConnectType> => {
  /* VERIFICAR
  if (!client.isConnected) await client.connect();
*/
  await client.connect();

  const db = client.db('schedule-classes');

  return { db, client };
};

export default connect;

import type { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import Nav from '../components/nav';

const Search: NextPage = () => {
  const { data: session, status: loading } = useSession();

  return (
    <>
      <Head>
        <title>Schedule Classes</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <main>
        <Nav />
        <h2>Bem vindo a página de busca</h2>
        {!session && (
          <div>
            Você não está logado. <br />
            Faça o login para continuar. <br />
          </div>
        )}
        {session && (
          <div>
            Logado como {session.user!.email} <br />
            Não é você? Clique no botão sair. <br />
          </div>
        )}
        {loading === 'loading' && (
          <div>
            CARREGANDO
          </div>
        )}
      </main>

      <footer>
        <p>All rights reserved.</p>
      </footer>
    </>
  );
};

export default Search;

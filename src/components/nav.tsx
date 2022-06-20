import { NextComponentType } from 'next';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

const Nav: NextComponentType = () => {
  const { data: session } = useSession();

  return (
    <nav>
      <ul>
        <Link href="/"><a>Início</a></Link>
        <Link href="/search"><a>Buscar Professor</a></Link>
        {session ? (
          <>
            <Link href="/profile"><a>Perfil</a></Link>
            <button onClick={(): Promise<void> => signOut({ callbackUrl: '/' })}>Sair</button>
          </>
          ) : (
            <button onClick={(): Promise<void> => signIn('auth0', { callbackUrl: '/profile' }, { prompt: 'login' })}>Login</button>
          )
        }
      </ul>
    </nav>
  );
};

export default Nav;

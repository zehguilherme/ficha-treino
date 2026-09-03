import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginGate } from '@/components/auth/LoginGate';

export const metadata: Metadata = {
  title: 'Entrar',
};

const LoginPage = () => {
  return (
    <main className="login-page flex-1 flex items-center justify-center px-4 py-8 bg-background">
      <LoginGate>
        <LoginForm />
      </LoginGate>
    </main>
  );
};

export default LoginPage;

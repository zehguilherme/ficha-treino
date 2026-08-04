import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar - Ficha de Treino',
};

const LoginPage = () => {
  return (
    <main className="login-page flex-1 flex items-center justify-center px-4 py-8 bg-background">
      <LoginForm />
    </main>
  );
};

export default LoginPage;

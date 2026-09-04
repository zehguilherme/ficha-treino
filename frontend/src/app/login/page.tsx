import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginGate } from '@/components/auth/LoginGate';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
};

const LoginPage = () => {
  return (
    <>
      <main className="login-page flex-1 flex items-center justify-center px-4 py-8 bg-background">
        <LoginGate>
          <LoginForm />
        </LoginGate>
      </main>
      <Footer />
    </>
  );
};

export default LoginPage;

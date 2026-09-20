import type { Metadata } from 'next';
import { LoginPage } from '@/components/marketing/LoginPage';

export const metadata: Metadata = { title: 'Sign In' };

export default function Login() {
  return <LoginPage />;
}

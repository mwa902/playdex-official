import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FloatingThemeToggle } from '@/components/ui/FloatingThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Playdex', template: '%s | Playdex' },
  description: 'Sports event operations platform — manage venues, events, and bookings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            {/* Floating theme toggle — fixed right edge, vertically centred */}
            <FloatingThemeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

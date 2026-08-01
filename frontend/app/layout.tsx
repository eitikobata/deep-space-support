import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Deep Space Support',
  description: 'Ticket and triage system for station transmissions',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

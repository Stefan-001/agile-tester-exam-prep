import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'Agile Tester Exam Prep',
  description: 'CTFL-AT exam preparation platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
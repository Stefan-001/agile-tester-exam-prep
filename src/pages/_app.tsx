import type { AppProps } from 'next/app';
import '../styles/globals.css';
import NavBar from '@/components/NavBar';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl p-4">
        <Component {...pageProps} />
      </main>
      <footer className="border-t border-gray-200 p-4 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
        © {new Date().getFullYear()} Agile Tester Exam Prep
      </footer>
    </div>
  );
}
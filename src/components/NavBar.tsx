import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80" aria-label="Primary">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link className="text-lg font-bold" href="/">
          Agile Tester Prep
        </Link>
        <div className="flex items-center gap-4">
          <Link className="hover:underline" href="/quiz">
            Quiz
          </Link>
          <Link className="hover:underline" href="/flashcards">
            Flashcards
          </Link>
          <Link className="hover:underline" href="/exam">
            Exam
          </Link>
          <Link className="hover:underline" href="/notes">
            Notes
          </Link>
          <Link className="hover:underline" href="/login">
            Login
          </Link>
          <Link className="hover:underline" href="/register">
            Register
          </Link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
}
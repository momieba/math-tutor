import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Seite nicht gefunden</h1>
      <Link to="/" className="text-indigo-700">
        Zur Startseite
      </Link>
    </div>
  );
}

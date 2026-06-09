import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ListBookForm from '../components/books/ListBookForm';

export default function Sell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="flex items-center justify-center h-64"><span className="animate-pulse">Loading…</span></div>;
  if (!user) {
    // redirect unauthenticated users to login
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sell a Book</h1>
      <ListBookForm />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SectionHeader from '../components/ui/SectionHeader';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from?.pathname || '/my-articles';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      // Redirect happens in useEffect
    } catch (err) {
      setError(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-white min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <SectionHeader
            eyebrow="Accès Réservé"
            title="Connexion"
            align="center"
          />
          <p className="mt-4 text-[#767676] text-sm">
            Espace d'administration et de contribution.
          </p>
        </div>

        <div className="bg-[#faf9f6] p-8 lg:p-10 border border-[#d8d5ce]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2">
                Adresse E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                placeholder="auteur@projetceedo20.org"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-[#767676] mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-[#d8d5ce] px-4 py-3 text-sm focus:border-[#8b6914] outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-[#8b6914] border-l-2 border-[#8b6914] pl-3 py-1 italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50"
            >
              {submitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] uppercase tracking-widest text-[#767676]">
          Infrastructure Intellectuelle Kamite
        </p>
      </div>
    </main>
  );
}

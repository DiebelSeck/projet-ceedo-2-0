import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Guard component that restricts access to users with specific editorial roles.
 * Roles: 'Admin', 'Editor', 'Reviewer'
 */
export default function RequireEditorialRole({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-[#C4965A]/20 border-t-[#C4965A] rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#767676] opacity-60">
          Vérification des droits...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role?.name || '';
  const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!isAuthorized) {
    return (
      <main className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-20 lg:py-32 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#8b6914] mb-6">
            Accès restreint
          </p>
          <h1 className="text-3xl font-serif text-[#1a1a1a] mb-6">
            Permissions insuffisantes
          </h1>
          <p className="text-[#4a4a4a] leading-relaxed mb-10">
            Votre compte ne dispose pas des privilèges nécessaires pour accéder à cet espace éditorial.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 border border-[#d8d5ce] text-[10px] font-bold uppercase tracking-widest hover:bg-[#faf9f6] transition-all"
            >
              Retour
            </button>
          </div>
        </div>
      </main>
    );
  }

  return children;
}

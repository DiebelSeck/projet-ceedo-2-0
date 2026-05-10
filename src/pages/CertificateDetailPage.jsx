import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CertificateDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        setLoading(true);
        const data = await api.getCertificateById(id);
        if (!data) throw new Error('Certificat introuvable ou non autorisé.');
        setCert(data);
        document.title = `Certificat - ${data.course_id?.title || 'Formation'}`;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Link to="/login" className="text-[#8b6914] uppercase text-[11px] tracking-widest font-bold">Se connecter</Link>
      </main>
    );
  }

  if (error || !cert) {
    return (
      <main className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-serif text-[#1a1a1a] mb-6">{error || 'Introuvable'}</h1>
          <Link to="/certificates" className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] uppercase font-bold tracking-widest">Retour</Link>
        </div>
      </main>
    );
  }

  const studentName = cert.user_id?.first_name 
    ? `${cert.user_id.first_name} ${cert.user_id.last_name || ''}` 
    : user?.first_name 
      ? `${user.first_name} ${user.last_name || ''}` 
      : 'Étudiant';

  return (
    <main className="min-h-screen bg-[#e8e6e1] py-12 px-6 print:bg-white print:p-0 print:m-0 flex flex-col items-center">
      {/* Controls - Hidden on print */}
      <div className="w-full max-w-[1050px] flex justify-between items-center mb-8 print:hidden">
        <Link to="/dashboard" className="text-[10px] uppercase tracking-widest font-bold text-[#4a4a4a] hover:text-[#8b6914]">
          ← Tableau de bord
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-[#8b6914] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#1a1a1a] transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Imprimer / PDF
        </button>
      </div>

      {/* Certificate A4 Landscape Canvas */}
      <div 
        className="w-[1050px] h-[742px] bg-white shadow-2xl print:shadow-none print:w-[1050px] print:h-[742px] relative overflow-hidden flex flex-col items-center justify-center p-20 border-[16px] border-[#faf9f6] outline outline-1 outline-[#d8d5ce]"
        style={{
          backgroundImage: 'radial-gradient(#d8d5ce 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      >
        {/* Decor */}
        <div className="absolute top-12 left-12 w-24 h-24 border-t-4 border-l-4 border-[#8b6914] opacity-50" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-b-4 border-r-4 border-[#8b6914] opacity-50" />

        <div className="text-center z-10 bg-white/90 p-12 backdrop-blur-sm outline outline-1 outline-[#e8e6e1]">
          <div className="mb-10 text-[#8b6914] uppercase tracking-[0.5em] font-bold text-sm">
            Projet Ceedo 2.0
          </div>
          
          <h1 className="text-5xl font-serif text-[#1a1a1a] mb-6" style={{ fontStyle: 'italic' }}>
            Certificat de réussite
          </h1>
          
          <p className="text-[#4a4a4a] text-sm uppercase tracking-widest mb-8">
            Est fièrement décerné à
          </p>

          <h2 className="text-4xl font-serif font-bold text-[#8b6914] mb-12 border-b-2 border-[#8b6914]/20 pb-4 inline-block min-w-[400px]">
            {studentName}
          </h2>

          <p className="text-[#4a4a4a] text-sm uppercase tracking-widest mb-6">
            Pour avoir complété avec succès le programme
          </p>

          <h3 className="text-2xl font-serif text-[#1a1a1a] mb-16 max-w-[600px] mx-auto leading-relaxed">
            {cert.course_id?.title || 'Formation Académique'}
          </h3>

          <div className="flex justify-between items-end w-full max-w-[700px] mx-auto mt-12 border-t border-[#d8d5ce] pt-8">
            <div className="text-left">
              <p className="text-[9px] uppercase tracking-widest text-[#767676] mb-1">Date de délivrance</p>
              <p className="font-serif text-sm text-[#1a1a1a]">{formatDate(cert.issued_at)}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-[#8b6914] rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-[#8b6914] text-xs">Ceedo</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-[#767676] mb-1">ID du certificat</p>
              <p className="font-mono text-xs text-[#1a1a1a]">{cert.certificate_code || cert.id.split('-')[0]}</p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </main>
  );
}

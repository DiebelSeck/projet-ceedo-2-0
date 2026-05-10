import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import SectionHeader from '../components/ui/SectionHeader';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CertificatesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Mes Certificats — Projet Ceedo 2.0';
    window.scrollTo(0, 0);
    return () => { document.title = 'Projet Ceedo 2.0'; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getUserCertificates();
        setCertificates(data || []);
      } catch (err) {
        console.error('Certificates load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8b6914]/20 border-t-[#8b6914] rounded-full animate-spin" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#767676]">Chargement...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="bg-white min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center flex flex-col gap-6">
          <p className="text-xl text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Accès réservé
          </p>
          <Link to="/login" className="self-center text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      <div className="bg-[#faf9f6] py-20 md:py-28 border-b border-[#d8d5ce]/30">
        <div className="max-w-5xl mx-auto px-6">
          <SectionHeader
            eyebrow="Académie"
            title="Mes Certificats"
            subtitle="Vos attestations de réussite aux programmes du Projet Ceedo."
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {certificates.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#e8e6e1]">
            <p className="text-[#767676] italic font-serif text-sm mb-4">
              Vous n'avez pas encore obtenu de certificat.
            </p>
            <Link to="/courses" className="inline-block text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]">
              Parcourir les formations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="border border-[#d8d5ce] bg-[#faf9f6] p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full border border-[#8b6914] flex items-center justify-center mb-6">
                  <span className="text-[#8b6914]">🎓</span>
                </div>
                <h3 className="text-lg font-serif text-[#1a1a1a] mb-2">{cert.course_id?.title}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#767676] mb-6">
                  Délivré le {formatDate(cert.issued_at)}
                </p>
                {cert.certificate_code && (
                  <p className="text-[10px] font-mono text-[#4a4a4a] bg-white px-3 py-1 border border-[#e8e6e1] mb-6">
                    ID: {cert.certificate_code}
                  </p>
                )}
                <Link
                  to={`/certificates/${cert.id}`}
                  className="px-6 py-3 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all"
                >
                  Voir certificat
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

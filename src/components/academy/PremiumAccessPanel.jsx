import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function PremiumAccessPanel({ course, accessStatus, setAccessStatus }) {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState(null);

  const priceFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: course?.currency || 'EUR'
  }).format(course?.price || 0);

  async function handleCheckout() {
    try {
      setRequesting(true);
      setError(null);
      const res = await api.createStripeCheckoutSession(course.id);
      window.location.href = res.url;
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de la session de paiement.');
      setRequesting(false);
    }
  }

  async function handleManualRequest() {
    try {
      setRequesting(true);
      setError(null);
      if (!user?.id) {
        throw new Error("Vous devez être connecté pour demander un accès.");
      }
      await api.requestCourseAccess(course.id, user.id);
      if (setAccessStatus) {
        setAccessStatus('pending');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la demande d\'accès.');
      setRequesting(false);
    }
  }

  return (
    <div className="bg-[#1a1a1a] text-white p-10 mt-12 mb-12 border-t-4 border-[#8b6914] text-center shadow-xl max-w-3xl mx-auto">
      <div className="w-16 h-16 mx-auto bg-white/10 flex items-center justify-center rounded-full mb-8 border border-white/20">
        <svg className="w-8 h-8 text-[#8b6914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">
        Accès premium
      </h2>
      
      <p className="text-lg font-serif italic text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
        Ce cours est payant. Pour accéder à ce contenu et à l'intégralité du programme, veuillez demander un accès.
      </p>

      <div className="text-3xl font-bold text-[#8b6914] tracking-wider mb-8">
        {priceFormatted}
      </div>

      {accessStatus === 'pending' ? (
        <div className="bg-[#8b6914]/20 border border-[#8b6914] p-4 text-[#8b6914] text-sm uppercase tracking-widest font-bold">
          Demande en attente de validation
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {error && <p className="text-[#8b6914] text-[11px]">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={requesting}
            className="inline-block px-10 py-5 bg-[#8b6914] text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
          >
            {requesting ? 'Redirection...' : 'Payer et accéder'}
          </button>
          <button
            onClick={handleManualRequest}
            disabled={requesting}
            className="inline-block px-10 py-3 bg-transparent border border-white/20 text-white/70 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
          >
            Demander accès manuel
          </button>
        </div>
      )}
    </div>
  );
}

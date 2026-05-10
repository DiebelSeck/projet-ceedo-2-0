import React from 'react';
import { Link } from 'react-router-dom';

export default function ProtectedLessonPanel({ type, course, onEnroll, enrolling, error }) {
  return (
    <div className="bg-[#faf9f6] border border-[#d8d5ce] p-10 lg:p-16 text-center max-w-3xl mx-auto my-16">
      <div className="w-16 h-16 mx-auto bg-white border border-[#d8d5ce] flex items-center justify-center rounded-full mb-8">
        <svg className="w-6 h-6 text-[#8b6914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#1a1a1a] mb-6">
        {type === 'login' ? 'Leçon réservée aux membres' : 'Inscription requise'}
      </h2>
      
      <p className="text-lg font-serif italic text-[#4a4a4a] leading-relaxed mb-10 max-w-xl mx-auto">
        {type === 'login' 
          ? "Ce contenu est exclusif aux membres du Projet Ceedo. Connectez-vous pour accéder à l'intégralité de la leçon."
          : `Pour accéder à cette leçon, vous devez être inscrit au cours "${course?.title || 'en cours'}". L'inscription est gratuite.`}
      </p>

      {error && (
        <p className="text-[11px] text-[#8b6914] border border-[#8b6914]/20 bg-[#8b6914]/5 p-3 mb-6 max-w-md mx-auto">
          {error}
        </p>
      )}

      {type === 'login' ? (
        <Link 
          to="/login"
          className="inline-block px-8 py-4 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all"
        >
          Se connecter
        </Link>
      ) : (
        <button
          onClick={onEnroll}
          disabled={enrolling}
          className="inline-block px-8 py-4 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#8b6914] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enrolling ? 'Inscription...' : "S'inscrire au cours"}
        </button>
      )}
    </div>
  );
}

import { useState } from 'react';
import TableOfContents from './TableOfContents';

export default function ArticleBody({ article, headings = [] }) {
  const {
    excerpt,
    editorial_note,
    content,
  } = article;

  const [isTocOpen, setIsTocOpen] = useState(false);

  return (
    <div className="article-content max-w-prose mx-auto lg:mx-0">
      {/* Mobile-only ToC */}
      <div className="lg:hidden mb-12">
        <button 
          onClick={() => setIsTocOpen(!isTocOpen)}
          className="w-full flex items-center justify-between p-4 bg-parchment border border-border-light text-[10px] uppercase font-bold tracking-widest text-ink mb-1"
        >
          Sommaire
          <span>{isTocOpen ? '−' : '+'}</span>
        </button>
        {isTocOpen && (
          <div className="p-6 bg-parchment/30 border border-border-light border-t-0">
            <TableOfContents headings={headings} />
          </div>
        )}
      </div>

      {/* Editorial Note */}
      {editorial_note && (
        <div className="mb-12 p-8 border border-gold-pale/30 text-base text-ink-muted leading-relaxed font-serif italic bg-parchment/20 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold-pale/40"></div>
          <span className="not-italic text-[10px] uppercase tracking-widest font-bold block mb-4 text-gold">Note de la rédaction</span>
          {editorial_note}
        </div>
      )}

      {/* Main Body with Academic Typography */}
      <style>{`
        .article-body-content p:first-of-type::first-letter {
          float: left;
          font-size: 4.5rem;
          line-height: 0.8;
          margin-right: 0.6rem;
          margin-top: 0.3rem;
          font-weight: bold;
          color: #8b6914;
          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
        }
      `}</style>
      <div 
        className="article-body-content prose prose-lg md:prose-xl prose-serif max-w-none 
          prose-headings:font-serif prose-headings:text-ink prose-headings:tracking-tight
          
          prose-h2:text-3xl prose-h2:mt-32 prose-h2:mb-10 prose-h2:pt-12 prose-h2:border-t prose-h2:border-border-light/40
          prose-h3:text-xl prose-h3:mt-16 prose-h3:mb-6 prose-h3:text-gold
          
          prose-p:text-ink-light prose-p:leading-[1.9] prose-p:mb-8 prose-p:text-justify
          
          prose-blockquote:border-l-2 prose-blockquote:border-gold prose-blockquote:bg-parchment/10 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:italic prose-blockquote:text-2xl prose-blockquote:font-serif prose-blockquote:text-ink/80 prose-blockquote:rounded-r-sm
          
          prose-li:text-ink-light prose-li:leading-relaxed prose-li:mb-4
          
          prose-img:rounded-sm prose-img:shadow-2xl prose-img:my-20"
        dangerouslySetInnerHTML={{ __html: content }}
      />


    </div>
  );
}

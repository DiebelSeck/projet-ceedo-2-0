import React, { useState, useEffect } from 'react';

export default function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length === 0) return null;

  return (
    <nav className="space-y-6">
      <h3 className="text-[9px] uppercase tracking-[0.3em] font-bold text-gold/60 mb-6 flex items-center gap-3">
        Sommaire
      </h3>
      <ul className="space-y-4">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li 
              key={heading.id} 
              className={`relative ${heading.level === 'h3' ? 'pl-5' : ''}`}
            >
              {isActive && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-[2px] h-3 bg-gold scale-y-100 transition-transform duration-300"></div>
              )}
              <a 
                href={`#${heading.id}`}
                className={`text-[12px] font-serif transition-all duration-300 leading-relaxed block 
                  ${isActive 
                    ? 'text-ink font-bold translate-x-2' 
                    : 'text-ink-muted hover:text-gold hover:translate-x-1'}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    const offset = 100;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


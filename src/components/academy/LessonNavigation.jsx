import { Link } from 'react-router-dom';

export default function LessonNavigation({ courseSlug, prevLesson, nextLesson, isCompleted }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-12 border-t border-[#d8d5ce]/30">
      {prevLesson ? (
        <Link
          to={`/courses/${courseSlug}/${prevLesson.slug}`}
          className="group flex flex-col items-start"
        >
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#767676] mb-2 group-hover:text-[#8b6914] transition-colors">
            ← Leçon précédente
          </span>
          <span className="text-sm font-serif font-bold text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors">
            {prevLesson.title}
          </span>
        </Link>
      ) : <div />}

      {nextLesson ? (
        isCompleted ? (
          <Link
            to={`/courses/${courseSlug}/${nextLesson.slug}`}
            className="group flex flex-col items-end text-right"
          >
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#8b6914] mb-2 group-hover:text-[#1a1a1a] transition-colors">
              Leçon suivante →
            </span>
            <span className="text-sm font-serif font-bold text-[#1a1a1a] group-hover:text-[#8b6914] transition-colors">
              {nextLesson.title}
            </span>
          </Link>
        ) : (
          <div className="flex flex-col items-end text-right opacity-35 cursor-not-allowed select-none">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#767676] mb-2">
              Leçon suivante →
            </span>
            <span className="text-sm font-serif font-bold text-[#1a1a1a]">
              {nextLesson.title}
            </span>
          </div>
        )
      ) : <div />}
    </div>
  );
}

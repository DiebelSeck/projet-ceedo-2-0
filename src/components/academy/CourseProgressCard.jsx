import { Link } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';

const STATUS_LABEL = {
  active:    'En cours',
  completed: 'Terminé',
};

const STATUS_CLASS = {
  active:    'text-[#8b6914] border-[#8b6914]',
  completed: 'text-[#1a1a1a] border-[#1a1a1a] bg-[#1a1a1a] text-white',
};

export default function CourseProgressCard({ enrollment }) {
  const course = enrollment.course_id;
  const progress = enrollment.progress_percentage ?? 0;
  const status = enrollment.status ?? 'active';

  return (
    <div className="border border-[#d8d5ce] bg-white p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <h3
          className="text-base font-semibold text-[#1a1a1a] leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {course?.title ?? '—'}
        </h3>
        <span
          className={`shrink-0 text-[10px] uppercase tracking-[0.2em] border px-2 py-0.5 ${STATUS_CLASS[status] ?? STATUS_CLASS.active}`}
        >
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#767676]">Progression</span>
          <span className="text-[11px] text-[#767676]">{Math.round(progress)} %</span>
        </div>
        <ProgressBar percentage={progress} />
      </div>

      {course?.slug && (
        <Link
          to={`/courses/${course.slug}`}
          className="self-start text-[11px] uppercase tracking-[0.3em] text-[#8b6914] border-b border-[#8b6914]/40 pb-0.5 hover:border-[#8b6914]"
        >
          Continuer
        </Link>
      )}
    </div>
  );
}

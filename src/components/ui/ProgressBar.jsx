export default function ProgressBar({ percentage }) {
  const clamped = Math.min(100, Math.max(0, percentage || 0));
  return (
    <div className="w-full h-1.5 bg-[#e8e6e1] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#8b6914] rounded-full"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

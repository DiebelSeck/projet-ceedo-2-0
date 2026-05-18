export default function AdminEmptyState({
  title = 'Aucune donnée disponible',
  message = 'Aucun résultat ne correspond aux critères actuels.',
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}

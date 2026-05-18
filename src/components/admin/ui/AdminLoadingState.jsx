export default function AdminLoadingState({ message = 'Chargement des données…' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-amber-700" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}

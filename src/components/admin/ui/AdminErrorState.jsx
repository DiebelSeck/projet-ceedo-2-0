export default function AdminErrorState({
  title = 'Erreur de chargement',
  message = 'Une erreur est survenue pendant la récupération des données.',
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
      <p className="text-sm font-semibold text-red-800">{title}</p>
      <p className="mt-2 text-sm text-red-700">{message}</p>
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-72 rounded-lg bg-line" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-line bg-white" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl border border-line bg-white" />
        ))}
      </div>
    </div>
  );
}

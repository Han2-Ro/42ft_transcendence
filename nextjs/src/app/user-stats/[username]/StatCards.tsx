export default function StatCards({
  stats,
}: {
  stats: { label: string; value: number }[];
}) {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {stats.map(({ label, value }) => {
        return (
          <div
            key={label}
            className="min-w-32 flex flex-col items-center p-2 shadow-md shadow-accent-primary/80 rounded-md bg-background-secondary"
          >
            <h3 className="">{label}</h3>
            <span className="text-3xl font-bold text-accent-primary">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

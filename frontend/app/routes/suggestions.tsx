import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SuggestionList, SUGGESTIONS_QUERY_KEY } from "~/components/SuggestionList";

const STATUS_FILTERS = ["tutte", "pending", "approved", "rejected"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function SuggestionsRoute() {
  const [status, setStatus] = useState<StatusFilter>("tutte");
  const queryClient = useQueryClient();

  const filterLabel = useMemo(() => {
    switch (status) {
      case "pending":
        return "In attesa";
      case "approved":
        return "Approvate";
      case "rejected":
        return "Respinte";
      default:
        return "Tutte";
    }
  }, [status]);

  const handleFilterChange = (next: StatusFilter) => {
    setStatus(next);
    // Force recalculation in cache when filter changes to highlight client-side caching
    queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-brand-secondary">Suggerimenti</h1>
          <p className="text-sm text-slate-300">
            Esplora le proposte inviate dalle lavoratrici e dai lavoratori e usa i voti per supportare le priorità.
          </p>
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide transition ${
                status === filter
                  ? "bg-brand-secondary text-slate-950"
                  : "border border-slate-700 text-slate-300 hover:border-brand-secondary"
              }`}
              onClick={() => handleFilterChange(filter)}
            >
              {filter === "tutte" ? "Tutte" : filter}
            </button>
          ))}
        </div>
      </header>
      <p className="text-sm text-slate-400">Filtro attivo: {filterLabel}</p>
      <SuggestionList showStatus statusFilter={status === "tutte" ? undefined : status} />
    </main>
  );
}

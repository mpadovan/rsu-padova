import { Link } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";

import { SuggestionList } from "~/components/SuggestionList";
import { useRootContext } from "~/root";
import { fetchSuggestions } from "~/utils/api.client";

export default function IndexRoute() {
  const env = useRootContext();
  const suggestionsQuery = useQuery({
    queryKey: ["suggestions", "top"],
    queryFn: () => fetchSuggestions(env.apiBaseUrl),
    staleTime: 1000 * 60
  });

  const topSuggestions = (suggestionsQuery.data ?? []).slice(0, 3);

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold text-brand-secondary">Dashboard richieste RSU</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Monitora le richieste più votate e aiuta la rappresentanza sindacale unitaria a scegliere le priorità.
          Usa il pannello per esplorare i suggerimenti e supportare quelli più rilevanti per il tuo team.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {topSuggestions.map((suggestion) => (
            <article key={suggestion.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="text-lg font-semibold text-slate-100">{suggestion.title}</h2>
              <p className="mt-2 text-sm text-slate-300 overflow-hidden text-ellipsis">
                {suggestion.description}
              </p>
              <p className="mt-4 text-sm font-medium text-brand-secondary">{suggestion.votes} voti</p>
            </article>
          ))}
          {topSuggestions.length === 0 ? (
            <p className="text-sm text-slate-400">Nessun suggerimento disponibile al momento.</p>
          ) : null}
        </div>
        <div className="mt-6">
          <Link
            to="/suggestions"
            className="inline-flex items-center rounded-md bg-brand-secondary px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Vai ai suggerimenti
          </Link>
        </div>
      </section>
      <SuggestionList showStatus />
    </main>
  );
}

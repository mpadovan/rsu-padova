import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useFirebaseAuth } from "~/hooks/useFirebaseAuth";
import { useRootContext } from "~/root";
import { fetchSuggestions, voteSuggestion, type Suggestion } from "~/utils/api.client";
import type { FirebaseConfig } from "~/utils/firebase.client";
import { VoteButton } from "./VoteButton";

const SUGGESTIONS_QUERY_KEY = ["suggestions"] as const;

type SuggestionListProps = {
  showStatus?: boolean;
  statusFilter?: "pending" | "approved" | "rejected";
};

export function SuggestionList({ showStatus, statusFilter }: SuggestionListProps) {
  const env = useRootContext();

  const firebaseConfig: FirebaseConfig = useMemo(
    () => ({
      apiKey: env.firebaseApiKey,
      authDomain: env.firebaseAuthDomain,
      projectId: env.firebaseProjectId,
      appId: env.firebaseAppId,
      allowedDomains: env.allowedGoogleDomains
    }),
    [env]
  );

  const { user, loading: authLoading, error: authError, signIn, signOut } = useFirebaseAuth(firebaseConfig);

  const queryClient = useQueryClient();

  const suggestionsQuery = useQuery({
    queryKey: SUGGESTIONS_QUERY_KEY,
    queryFn: () => fetchSuggestions(env.apiBaseUrl)
  });

  const mutation = useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: 1 | -1 }) => {
      const token = user ? await user.getIdToken() : undefined;
      return await voteSuggestion(env.apiBaseUrl, id, delta, token);
    },
    onMutate: async ({ id, delta }) => {
      await queryClient.cancelQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Suggestion[]>(SUGGESTIONS_QUERY_KEY);
      if (previous) {
        const updated = previous
          .map((suggestion) =>
            suggestion.id === id ? { ...suggestion, votes: suggestion.votes + delta } : suggestion
          )
          .sort((a, b) => b.votes - a.votes);
        queryClient.setQueryData(SUGGESTIONS_QUERY_KEY, updated);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SUGGESTIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY });
    }
  });

  const suggestions = suggestionsQuery.data ?? [];
  const filteredSuggestions = statusFilter
    ? suggestions.filter((suggestion) => suggestion.status === statusFilter)
    : suggestions;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Suggerimenti della comunità</h2>
          <p className="text-sm text-slate-400">
            Vota le richieste più importanti per prioritizzare il lavoro della RSU.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row">
          {user ? (
            <>
              <span className="text-sm text-slate-300">Accesso come {user.email}</span>
              <button
                type="button"
                className="rounded-md bg-slate-800 px-3 py-1 text-sm font-medium hover:bg-slate-700"
                onClick={() => signOut()}
              >
                Esci
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-md bg-brand-secondary px-3 py-1 text-sm font-medium text-slate-950 hover:bg-sky-400"
              onClick={() => signIn()}
              disabled={authLoading}
            >
              Accedi con Google
            </button>
          )}
        </div>
      </header>
      {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
      {suggestionsQuery.isLoading ? (
        <p>Caricamento dei suggerimenti…</p>
      ) : suggestionsQuery.isError ? (
        <p className="text-rose-300">{(suggestionsQuery.error as Error).message}</p>
      ) : (
        <ul className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-brand-secondary">{suggestion.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{suggestion.description}</p>
                  {showStatus && suggestion.status ? (
                    <span className="mt-2 inline-flex rounded-md bg-slate-800 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-300">
                      {suggestion.status}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-3xl font-bold text-slate-100">{suggestion.votes}</span>
                  <div className="flex gap-2">
                    <VoteButton
                      direction="up"
                      onVote={() => mutation.mutate({ id: suggestion.id, delta: 1 })}
                      disabled={!user}
                      loading={mutation.isPending}
                    />
                    <VoteButton
                      direction="down"
                      onVote={() => mutation.mutate({ id: suggestion.id, delta: -1 })}
                      disabled={!user}
                      loading={mutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { SUGGESTIONS_QUERY_KEY };

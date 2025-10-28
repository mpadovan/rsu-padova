export type Suggestion = {
  id: string;
  title: string;
  description: string;
  votes: number;
  status?: "pending" | "approved" | "rejected";
};

export async function fetchSuggestions(apiBaseUrl: string): Promise<Suggestion[]> {
  const response = await fetch(`${apiBaseUrl}/suggestions`);
  if (!response.ok) {
    throw new Error("Impossibile caricare i suggerimenti");
  }
  const data = (await response.json()) as Suggestion[];
  return data.sort((a, b) => b.votes - a.votes);
}

export async function voteSuggestion(
  apiBaseUrl: string,
  suggestionId: string,
  delta: 1 | -1,
  token?: string
): Promise<Suggestion> {
  const response = await fetch(`${apiBaseUrl}/suggestions/${suggestionId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ delta })
  });

  if (!response.ok) {
    throw new Error("Voto non riuscito");
  }

  return (await response.json()) as Suggestion;
}

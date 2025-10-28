import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SuggestionList } from "~/components/SuggestionList";

vi.mock("~/root", () => ({
  useRootContext: () => ({
    firebaseApiKey: "test",
    firebaseAuthDomain: "test",
    firebaseProjectId: "test",
    firebaseAppId: "test",
    allowedGoogleDomains: ["example.com"],
    apiBaseUrl: "http://localhost:3000"
  })
}));

const mockSignIn = vi.fn();
const mockSignOut = vi.fn();

vi.mock("~/hooks/useFirebaseAuth", () => ({
  useFirebaseAuth: () => ({
    user: {
      email: "user@example.com",
      getIdToken: vi.fn().mockResolvedValue("token")
    },
    loading: false,
    error: undefined,
    signIn: mockSignIn,
    signOut: mockSignOut
  })
}));

describe("SuggestionList", () => {
  const createClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30,
          retry: false
        }
      }
    });

  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis.fetch as unknown) = vi.fn();
  });

  it("ordina i suggerimenti per numero di voti", async () => {
    const suggestions = [
      { id: "1", title: "Wi-Fi veloce", description: "Aggiornare la rete", votes: 5 },
      { id: "2", title: "Mensa serale", description: "Estendere gli orari", votes: 12 }
    ];

    (fetch as unknown as Mock).mockResolvedValue(
      new Response(JSON.stringify(suggestions), { status: 200 })
    );

    render(
      <QueryClientProvider client={createClient()}>
        <SuggestionList />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText("Mensa serale")).toBeInTheDocument());
    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titles).toEqual(["Mensa serale", "Wi-Fi veloce"]);
  });

  it("mantiene i dati in cache tra i render anche offline", async () => {
    const queryClient = createClient();
    const suggestions = [
      { id: "1", title: "Wi-Fi veloce", description: "Aggiornare la rete", votes: 5 }
    ];

    (fetch as unknown as Mock).mockResolvedValueOnce(
      new Response(JSON.stringify(suggestions), { status: 200 })
    );

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <SuggestionList />
      </QueryClientProvider>
    );

    await waitFor(() => expect(screen.getByText("Wi-Fi veloce")).toBeInTheDocument());
    unmount();

    (fetch as unknown as Mock).mockRejectedValueOnce(new Error("network"));

    render(
      <QueryClientProvider client={queryClient}>
        <SuggestionList />
      </QueryClientProvider>
    );

    expect(await screen.findByText("Wi-Fi veloce")).toBeInTheDocument();
  });
});

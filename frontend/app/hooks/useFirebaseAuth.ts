import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  listenToAuthChanges,
  signInWithGoogleDomain,
  logout,
  type FirebaseConfig
} from "~/utils/firebase.client";

export function useFirebaseAuth(config: FirebaseConfig) {
  const isServer = typeof window === "undefined";
  const noop = async () => undefined;

  if (isServer) {
    return {
      user: null,
      loading: true,
      error: undefined,
      signIn: noop,
      signOut: noop
    } as const;
  }

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(config, (state) => {
      setUser(state.user);
      setLoading(state.loading);
      setError(state.error);
    });
    return () => unsubscribe();
  }, [config]);

  const actions = useMemo(
    () => ({
      async signIn() {
        try {
          await signInWithGoogleDomain(config);
          setError(undefined);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Errore sconosciuto");
        }
      },
      async signOut() {
        await logout(config);
      }
    }),
    [config]
  );

  return { user, loading, error, ...actions };
}

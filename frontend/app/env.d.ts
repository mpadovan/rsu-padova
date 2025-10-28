declare global {
  interface Window {
    ENV: {
      firebaseApiKey: string;
      firebaseAuthDomain: string;
      firebaseProjectId: string;
      firebaseAppId: string;
      allowedGoogleDomains: string[];
      apiBaseUrl: string;
    };
  }
}

export {};

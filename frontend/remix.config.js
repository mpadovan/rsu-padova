/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: "app",
  assetsBuildDirectory: "build/client",
  publicPath: "/build/",
  serverBuildPath: "build/server/index.js",
  serverModuleFormat: "esm",
  ignoredRouteFiles: ["**/.*"],
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true
  },
  tailwind: true,
  watchPaths: ["./tailwind.config.ts"]
};

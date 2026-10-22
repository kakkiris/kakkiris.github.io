import { defineConfig } from "astro/config";

// Static output. Pages build as work/cedar-peak.html so /work/cedar-peak is served
// directly on GitHub Pages, with no trailing-slash redirect to drop the ?lens= query.
export default defineConfig({
  site: "https://kakkiris.github.io",
  output: "static",
  trailingSlash: "never",
  build: {
    format: "file",
    inlineStylesheets: "always",
  },
  devToolbar: { enabled: false },
});

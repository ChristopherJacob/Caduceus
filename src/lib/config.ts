// Override at build time with VITE_PACK_BASE_URL. Default targets GitHub Pages
// for this repo at its Caduceus project path.
export const PACK_BASE_URL: string =
  (import.meta.env.VITE_PACK_BASE_URL as string | undefined) ??
  'https://christopherjacob.github.io/Caduceus/packs';

// The project's source repository, linked from the app footer.
export const REPO_URL = 'https://github.com/ChristopherJacob/Caduceus';

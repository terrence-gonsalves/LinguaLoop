// feature flags for parts of the app that exist in code but are off for this release.
// flip a flag to true to bring the feature back.
export const FEATURES = {
  // connections: following other users, their profiles and streaks.
  // off for v1: RLS only lets users read their own profiles, languages and follows,
  // so connections can't work until cross-user reads are designed.
  connections: false,
} as const;

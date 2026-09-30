import { router } from 'expo-router';

import { useEffect } from 'react';

type FeatureOffRedirectProps = {
  to: string;
};

// rendered in place of a screen whose feature flag is off.
// replaces the route so the hidden screen never mounts or runs its queries.
export default function FeatureOffRedirect({ to }: FeatureOffRedirectProps) {
  useEffect(() => {
    router.replace(to);
  }, [to]);

  return null;
}

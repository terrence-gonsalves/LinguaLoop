declare module "expo-router" {
  export interface TypedRoutes {
    "/(auth)": {
      login: undefined;
      "create-account": undefined;
      "forgot-password": undefined;
    };
    "/(stack)": {
      onboarding: undefined;
    };
    "/(tabs)": {
      profile: undefined;
    };
  }

  export const router: {
    push: (route: keyof TypedRoutes | string) => void;
    replace: (route: keyof TypedRoutes | string) => void;
    back: () => void;
  };
} 
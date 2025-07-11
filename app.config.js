import 'dotenv/config';

export default {
  expo: {
    name: "LinguaLoop",
    slug: "LinguaLoop",
    version: "0.6.2",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lingualoop",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "cover",
      backgroundColor: "#F0F3F4"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      router: {},
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      }
    },
    ios: {
      supportsTablet: true,
      uildNumber: "1",
      splash: {
        image: "./assets/images/icon.png",
        resizeMode: "cover",
        backgroundColor: "#F0F3F4"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#F0F3F4"
      },
      splash: {
        image: "./assets/images/icon.png",
        resizeMode: "cover",
        backgroundColor: "#F0F3F4"
      },
      versionCode: 1,
      edgeToEdgeEnabled: true,
      package: "com.bloopa.LinguaLoop",
      permissions: [
        "NOTIFICATIONS",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageResizeMode: "cover",
          backgroundColor: "#F0F3F4"
        }
      ],
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#F0F3F4"
        }
      ],
      "expo-web-browser"
    ],
    experiments: {
      typedRoutes: true
    },
    owner: "terrence.gonsalves"
  }
}

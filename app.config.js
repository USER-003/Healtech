// app.config.js
import "dotenv/config";

export default {
  expo: {
    name: "Healtech-Project",
    scheme: "healtech",
    deepLinking: true,
    slug: "Healtech-Project",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logoh.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/logoh.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.example.healtech", 
      permissions: ["INTERNET", "SYSTEM_ALERT_WINDOW"],
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: "7c72-181-119-98-211.ngrok-free.app",
              pathPrefix: "/.*$"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]}],
      adaptiveIcon: {
        foregroundImage: "./assets/logoh.png",
        backgroundColor: "#ffffff",
      },
      versionCode: 1, // Incrementa este valor en futuras builds
    },
    web: {
      favicon: "./assets/logoh.png",
      bundler: "metro",
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      databaseURL: process.env.DATABASE_URL,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      eas: {
        projectId: "4feb2917-17a6-44f9-8909-13d0bb929c44",
      },
    },
    plugins: [],
  },
};

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Ziyara.app',
  appName: 'Ziyara',

  // 👇 سيبه موجود حتى لو مش هنستخدمه دلوقتي
  webDir: 'public',

  // 👇 هنا رابط الموقع
  server: {
    url: 'https://ziyara-tau.vercel.app', // حط رابط موقعك هنا
    cleartext: true
  },

  // 👇 إعدادات Google Native Plugin
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1030537595001-rq254p3f246kvk2tsel56dkfe73hbegu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
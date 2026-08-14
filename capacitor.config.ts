import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hydrobalance.app',
  appName: 'HydroBalance',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: false
    }
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;

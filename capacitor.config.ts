import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.base6a654dcc789406839dc9b542.app',
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

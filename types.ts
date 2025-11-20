export type AppState = 'idle' | 'recording' | 'screenshotting' | 'finished';

export type MediaType = 'video' | 'image';

export interface AppConfig {
  audioSource: 'tab' | 'mic' | 'none';
  videoQuality: 'hd' | 'sd';
  screenshotRange: 'full' | 'visible';
  screenshotLimit: number;
  hideFixedNav: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  audioSource: 'tab',
  videoQuality: 'hd',
  screenshotRange: 'full',
  screenshotLimit: 10,
  hideFixedNav: true,
};
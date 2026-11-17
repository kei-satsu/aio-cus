export type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  primarySoft: string;
  info: string;
  danger: string;
  badge: string;
  success: string;
  warning: string;
  returned: string;
  shadow: string;
};

const lightColors: AppColors = {
  background: '#F4F7FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFD',
  text: '#101828',
  muted: '#66758D',
  border: '#E4EAF2',
  primary: '#CC4E00',
  primaryText: '#FFFFFF',
  primarySoft: '#FFF1E6',
  info: '#2563EB',
  danger: '#B42318',
  badge: '#FFF1E6',
  success: '#16803C',
  warning: '#A16207',
  returned: '#B42318',
  shadow: '#101828',
};

const darkColors: AppColors = {
  background: '#0B1220',
  surface: '#111C2E',
  surfaceMuted: '#17243A',
  text: '#F3F6FC',
  muted: '#9CAAC0',
  border: '#2A3A51',
  primary: '#FDBA74',
  primaryText: '#2D1302',
  primarySoft: '#3A2417',
  info: '#60A5FA',
  danger: '#FDA29B',
  badge: '#3A2417',
  success: '#6CE9A6',
  warning: '#FEC84B',
  returned: '#FDA29B',
  shadow: '#000000',
};

export function getAppColors(isDark: boolean): AppColors {
  return isDark ? darkColors : lightColors;
}

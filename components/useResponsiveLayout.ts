import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

  return {
    isCompact: width < 380,
    isTablet: width >= 768,
    isWide: width >= 900,
    horizontalPadding: width < 360 ? 14 : width >= 900 ? 32 : width >= 768 ? 28 : 20,
  };
}

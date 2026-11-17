import { Link, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { getAppColors } from '@/constants/AppColors';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const appColors = getAppColors(colorScheme === 'dark');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          display: 'none',
          height: 68,
          paddingTop: 7,
          paddingBottom: 8,
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: colorScheme === 'dark' ? '#2A3A51' : '#E4EAF2',
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
        },
        headerShadowVisible: false,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={styles.logoSlot}>
              <View style={styles.logoImageFrame}>
                <Image
                  accessibilityLabel="All In One Express logo"
                  source={require('../../assets/images/logo.png')}
                  resizeMode="contain"
                  style={styles.logoImage}
                />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.logoText, { color: Colors[colorScheme].text }]}>
                ALL In One Express
              </Text>
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'house.fill',
                android: 'home',
                web: 'home',
              }}
              tintColor={color}
              size={28}
            />
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <Link href="/profile" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open profile"
                  style={({ pressed }) => [
                    styles.profileButton,
                    {
                      backgroundColor: appColors.primarySoft,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <SymbolView
                    name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
                    size={22}
                    tintColor={Colors[colorScheme].text}
                  />

                </Pressable>
              </Link>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoSlot: {
    maxWidth: 250,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logoImageFrame: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  logoText: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 12,
  },
  profileButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    borderRadius: 14,
  },
  profileLabel: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.6,
  },
});

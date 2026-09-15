import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGES = [
  {
    title: 'Access more.\nOwn less.',
    description: 'Rent everyday essentials\nfrom people near you.',
    image: require('@/assets/images/welcome-rental-items.png'),
    imageDescription: 'A bicycle, camping tent, camera, drill, luggage, chair and plant available to rent',
  },
  {
    title: 'Big plans.\nLess baggage.',
    description: 'Find the gear you need\nfor your next adventure.',
    image: require('@/assets/images/welcome-adventure.png'),
    imageDescription: 'A hiking backpack, sleeping bag, suitcase, boots and camping equipment',
  },
  {
    title: 'Make it happen.\nMake room for more.',
    description: 'From weekend projects to getaways,\nrent what you need, when you need it.',
    image: require('@/assets/images/welcome-projects.png'),
    imageDescription: 'A drill, toolbox, stepladder and tools for a weekend DIY project',
  },
  {
    title: 'Good things.\nBetter shared.',
    description: 'Discover what your neighborhood\nhas to offer.',
    image: require('@/assets/images/welcome-community.png'),
    imageDescription: 'Two neighbors sharing a camera, with a projector and picnic blanket nearby',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width: windowWidth, height, fontScale } = useWindowDimensions();
  const width = Math.min(windowWidth, 480);
  const compact = height < 700 || fontScale > 1.3;
  const pages = useRef<FlatList<(typeof PAGES)[number]>>(null);
  const [activePage, setActivePage] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const enterApp = () => router.replace('/home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={[styles.screen, { width }]}>
        <View style={styles.toolbar}>
          <Pressable
            onPress={enterApp}
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          key={width}
          ref={pages}
          data={PAGES}
          horizontal
          pagingEnabled
          bounces={false}
          initialScrollIndex={activePage}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.title}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={({ nativeEvent }) => {
            setActivePage(Math.round(nativeEvent.contentOffset.x / width));
          }}
          style={styles.pages}
          onLayout={({ nativeEvent }) => setPageHeight(nativeEvent.layout.height)}
          renderItem={({ item }) => (
            <View style={[styles.page, { width, height: pageHeight }]}>
              <View style={[styles.copy, compact && styles.compactCopy]}>
                <Text accessibilityRole="header" style={[styles.title, compact && styles.compactTitle]}>
                  {item.title}
                </Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Image
                source={item.image}
                style={styles.artwork}
                contentFit="contain"
                accessibilityLabel={item.imageDescription}
              />
            </View>
          )}
        />

        <View style={styles.footer}>
          <View accessibilityRole="tablist" accessibilityLabel="Introduction pages" style={styles.pagination}>
            {PAGES.map((page, index) => (
              <Pressable
                key={page.title}
                accessibilityRole="tab"
                accessibilityLabel={`Page ${index + 1} of ${PAGES.length}`}
                accessibilityState={{ selected: activePage === index }}
                onPress={() => {
                  setActivePage(index);
                  pages.current?.scrollToIndex({ index, animated: false });
                }}
                style={styles.dotTarget}>
                <View style={[styles.dot, activePage === index && styles.activeDot]} />
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/signup')}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            <Text style={styles.buttonText}>Get started</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F0',
    alignItems: 'center',
  },

  screen: {
    flex: 1,
  },

  toolbar: {
    height: 48,
    paddingHorizontal: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  skip: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipText: {
    color: '#393E43',
    fontSize: 14,
    fontWeight: '500',
  },

  pressed: {
    opacity: 0.55,
  },

  pages: {
    flex: 1,
  },

  page: {
    flex: 1,
  },

  copy: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 14,
  },

  compactCopy: {
    paddingTop: 6,
    paddingBottom: 8,
    gap: 10,
  },

  title: {
    color: '#141A22',
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -1.2,
    textAlign: 'center',
  },

  compactTitle: {
    fontSize: 30,
    lineHeight: 34,
  },

  description: {
    color: '#686B6C',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  artwork: {
    flex: 1,
    width: '100%',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },

  dotTarget: {
    width: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D8D2',
  },

  activeDot: {
    backgroundColor: '#FC5B2C',
  },

  button: {
    minHeight: 56,
    borderRadius: 30,
    backgroundColor: '#FC5B2C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  buttonPressed: {
    backgroundColor: '#E94A1C',
    transform: [{ scale: 0.99 }],
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

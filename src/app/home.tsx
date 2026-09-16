import { useListings } from '@/hooks/use-listings';
import type { Listing as Item } from '@/services/listings';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Change the Home screen colors here.
const COLORS = {
  background: '#FAF7F0',
  card: '#FFFFFF',
  text: '#20252B',
  muted: '#828481',
  accent: '#FC5B2C',
  peach: '#FFE2D5',
  border: '#EDE7DD',
  search: '#F0EDE6',
};

const CATEGORIES = [
  { name: 'Tools', icon: 'build-outline' },
  { name: 'Electronics', icon: 'desktop-outline' },
  { name: 'Outdoor', icon: 'bonfire-outline' },
  { name: 'Events', icon: 'calendar-outline' },
  { name: 'Home', icon: 'home-outline' },
  { name: 'Sports', icon: 'basketball-outline' },
  { name: 'Party', icon: 'balloon-outline' },
  { name: 'See all', icon: 'ellipsis-horizontal' },
] as const;


type Panel = 'location' | 'notifications' | 'bookings' | 'profile' | 'create' | null;

export default function HomeScreen() {
  const router = useRouter();
  const { listings, loading, error, reload } = useListings();
  const scroll = useRef<ScrollView>(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('See all');
  const [location, setLocation] = useState('San Diego, CA');
  const [locationDraft, setLocationDraft] = useState(location);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Item | null>(null);

  const filtered = listings.filter(
    (item) =>
      (category === 'See all' ? item.featured : item.category === category) &&
      item.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const close = () => {
    setPanel(null);
    setSelected(null);
  };

  const signIn = () => {
    close();
    router.push('/login');
  };

  const reset = () => {
    setQuery('');
    setCategory('See all');
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.shell}>
        <ScrollView
          ref={scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top bar */}
          <View style={styles.topbar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change location"
              onPress={() => {
                setLocationDraft(location);
                setPanel('location');
              }}
              style={styles.location}
            >
              <Ionicons name="location" size={18} color={COLORS.accent} />
              <Text numberOfLines={1} style={styles.locationText}>
                {location}
              </Text>
              <Ionicons name="chevron-down" size={12} color={COLORS.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => setPanel('notifications')}
              style={styles.iconButton}
            >
              <Ionicons name="notifications-outline" size={23} color={COLORS.text} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Your profile"
              onPress={() => router.push('/profile')}
              style={styles.avatar}
            >
              <Ionicons name="person" size={20} color="#8D614D" />
            </Pressable>
          </View>

          {/* Greeting */}
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.subtitle}>Let's find what you need!</Text>

          {/* Search */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search rentals"
            onPress={() => router.push({ pathname: '/search', params: { focus: 'true' } })}
            style={styles.searchBox}
          >
            <Ionicons name="search" size={19} color={COLORS.muted} />
            <Text style={styles.searchPlaceholder}>Search for anything...</Text>
          </Pressable>

          {/* Categories */}
          <View style={styles.categories}>
            {CATEGORIES.map((entry) => (
              <Pressable
                key={entry.name}
                accessibilityRole="button"
                accessibilityState={{ selected: category === entry.name }}
                onPress={() => setCategory(entry.name)}
                style={styles.category}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    category === entry.name && entry.name !== 'See all' && styles.categorySelected,
                  ]}
                >
                  <Ionicons
                    name={entry.icon}
                    size={27}
                    color={category === entry.name && entry.name !== 'See all' ? COLORS.card : '#A35C43'}
                  />
                </View>
                <Text style={styles.categoryLabel}>{entry.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Section heading */}
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>
              {category === 'See all' ? 'Featured near you' : category}
            </Text>
            <Pressable accessibilityRole="button" onPress={reset} hitSlop={10}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {/* Item cards */}
          {loading && <Text style={styles.body}>Loading rentals…</Text>}
          {error && <Pressable onPress={reload}><Text style={styles.body}>{error} Tap to retry.</Text></Pressable>}
          <View style={styles.cards}>
            {filtered.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, $${item.price} per day. View details`}
                onPress={() => router.push({ pathname: '/listing-details', params: { id: item.id } })}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.photoWrap}>
                  <Image source={item.image} style={styles.photo} contentFit="cover" />
                  <View style={styles.priceBadge}>
                    <Text style={styles.price}>
                      ${item.price}
                      <Text style={styles.perDay}>/day</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text numberOfLines={1} style={styles.itemName}>
                    {item.name}
                  </Text>
                  <View style={styles.metadata}>
                    <Ionicons name="star" size={12} color="#F69A29" />
                    <Text style={styles.metaText}>
                      {item.local ? 'New' : `${item.rating} (${item.reviews})`}
                    </Text>
                    <Text style={styles.metaText}>·</Text>
                    <Text style={styles.metaText}>{item.local ? 'Your preview' : `${item.distance} mi`}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Empty state */}
          {!loading && !error && !filtered.length && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={32} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No matching rentals</Text>
              <Text style={styles.body}>Try another search or category.</Text>
              <Pressable onPress={reset} accessibilityRole="button">
                <Text style={styles.seeAll}>Show all items</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sampleNote}>Local previews and sample listings · Not publicly published.</Text>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.navigation}>
          <Pressable accessibilityRole="button" accessibilityLabel="Home" onPress={reset} style={styles.navItem}>
            <Ionicons name="home" size={23} color={COLORS.accent} />
            <Text style={[styles.navLabel, styles.activeLabel]}>Home</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search"
            onPress={() => router.push({ pathname: '/search', params: { q: query } })}
            style={styles.navItem}
          >
            <Ionicons name="search-outline" size={23} color={COLORS.muted} />
            <Text style={styles.navLabel}>Search</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="List an item"
            onPress={() => router.push('/listing')}
            style={styles.addButton}
          >
            <Ionicons name="add" size={32} color="white" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bookings"
            onPress={() => router.push('/booking')}
            style={styles.navItem}
          >
            <Ionicons name="receipt-outline" size={23} color={COLORS.muted} />
            <Text style={styles.navLabel}>Bookings</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => router.push('/profile')}
            style={styles.navItem}
          >
            <Ionicons name="person-outline" size={23} color={COLORS.muted} />
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom sheet modal: item detail / location / notifications / bookings / profile / create */}
      <Modal visible={!!panel || !!selected} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.scrim}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            style={StyleSheet.absoluteFill}
            onPress={close}
          />
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sectionTitle}>
                {selected?.name ??
                  ({
                    location: 'Your location',
                    notifications: 'Notifications',
                    bookings: 'Your bookings',
                    profile: 'Your profile',
                    create: 'List an item',
                  }[panel ?? 'profile'])}
              </Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.iconButton}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            {selected ? (
              <>
                <Image source={selected.image} style={styles.detailImage} contentFit="contain" />
                <Text style={styles.detailPrice}>${selected.price} / day</Text>
                <Text style={styles.body}>{selected.description}</Text>
                <Text style={styles.sampleNote}>Sample listing — booking is not available yet.</Text>
              </>
            ) : panel === 'location' ? (
              <>
                <Text style={styles.body}>
                  Choose the city shown on your Home screen. Listings currently use sample distances.
                </Text>
                <TextInput
                  accessibilityLabel="City"
                  value={locationDraft}
                  onChangeText={setLocationDraft}
                  style={styles.cityInput}
                  placeholder="City, state"
                />
                <Pressable
                  accessibilityRole="button"
                  style={styles.primaryButton}
                  onPress={() => {
                    if (locationDraft.trim()) {
                      setLocation(locationDraft.trim());
                      close();
                    }
                  }}
                >
                  <Text style={styles.primaryText}>Save location</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Ionicons
                  name={
                    panel === 'notifications'
                      ? 'notifications-outline'
                      : panel === 'bookings'
                      ? 'calendar-outline'
                      : panel === 'create'
                      ? 'add-circle-outline'
                      : 'person-circle-outline'
                  }
                  size={42}
                  color={COLORS.accent}
                  style={styles.sheetIcon}
                />
                <Text style={styles.body}>
                  {panel === 'notifications'
                    ? "You're all caught up. Updates will appear here."
                    : panel === 'bookings'
                    ? 'Your upcoming rentals will appear here once you have a booking.'
                    : panel === 'create'
                    ? 'Sign in to get started with listing an item for your neighbors.'
                    : 'Sign in to manage your rentals and account.'}
                </Text>
                {(panel === 'profile' || panel === 'create') && (
                  <Pressable accessibilityRole="button" onPress={signIn} style={styles.primaryButton}>
                    <Text style={styles.primaryText}>Sign in</Text>
                  </Pressable>
                )}
              </>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minHeight: 44,
  },
  locationText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  iconButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ECD5C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    color: '#4D535B',
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.search,
    borderRadius: 24,
    paddingHorizontal: 14,
    marginBottom: 20,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.muted,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
    paddingHorizontal: 8,
    paddingVertical: 20,
    backgroundColor: '#fff8e9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0EBE2',
    marginBottom: 28,
  },
  category: {
    width: '25%',
    alignItems: 'center',
    gap: 7,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelected: {
    backgroundColor: COLORS.accent,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#555B61',
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  seeAll: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  photoWrap: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  price: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  perDay: {
    fontWeight: '500',
    fontSize: 12,
  },
  cardBody: {
    padding: 8,
    gap: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    color: COLORS.muted,
  },
  pressed: {
    opacity: 0.75,
  },
  sampleNote: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    marginTop: 12,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },
  activeLabel: {
    color: COLORS.accent,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: '#62666A',
    marginBottom: 16,
  },
  scrim: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetIcon: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  detailImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  cityInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

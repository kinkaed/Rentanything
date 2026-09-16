import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Search screen appearance and sample listings.
const COLORS = { background: '#FAF7F0', surface: '#F1EEE8', text: '#242931', muted: '#8B8E92', orange: '#FC5B2C', border: '#E8E4DC', white: '#FFFFFF' };
const CATEGORIES = ['All', 'Tools', 'Electronics', 'Outdoor'] as const;
const LISTINGS = [
  { id: 'washer', name: 'Pressure Washer', category: 'Tools', price: 25, rating: 4.8, reviews: 40, distance: 1.2, image: require('@/assets/images/home-washer.png') },
  { id: 'tent', name: 'Camping Tent', category: 'Outdoor', price: 30, rating: 4.7, reviews: 28, distance: 2.1, image: require('@/assets/images/search-tent.png') },
  { id: 'drill', name: 'Cordless Drill', category: 'Tools', price: 15, rating: 4.9, reviews: 36, distance: 1.8, image: require('@/assets/images/search-drill.png') },
  { id: 'speaker', name: 'JBL Party Speaker', category: 'Electronics', price: 40, rating: 4.6, reviews: 24, distance: 3.2, image: require('@/assets/images/search-speaker.png') },
  { id: 'bike', name: 'Mountain Bike', category: 'Outdoor', price: 28, rating: 4.8, reviews: 31, distance: 2.8, image: require('@/assets/images/search-bike.png') },
  { id: 'projector', name: 'Projector', category: 'Electronics', price: 35, rating: 4.7, reviews: 20, distance: 2.9, image: require('@/assets/images/search-projector.png') },
];
type Listing = (typeof LISTINGS)[number];
type FilterPanel = 'distance' | 'sort' | 'price' | 'all' | null;
const SORTS = ['Recommended', 'Price: low to high', 'Price: high to low', 'Nearest first', 'Top rated'] as const;
type Sort = (typeof SORTS)[number];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [category, setCategory] = useState<string>('All');
  const [distance, setDistance] = useState(5);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>('Recommended');
  const [saved, setSaved] = useState<string[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [panel, setPanel] = useState<FilterPanel>(null);
  const [selected, setSelected] = useState<Listing | null>(null);
  const close = () => { setPanel(null); setSelected(null); };
  const resetFilters = () => { setCategory('All'); setDistance(5); setMaxPrice(0); setSort('Recommended'); setSavedOnly(false); };
  const results = LISTINGS.filter(item =>
    (category === 'All' || item.category === category) &&
    item.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    (!distance || item.distance <= distance) && (!maxPrice || item.price <= maxPrice) &&
    (!savedOnly || saved.includes(item.id))
  ).sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : sort === 'Nearest first' ? a.distance - b.distance : sort === 'Top rated' ? b.rating - a.rating : 0);

  function option(label: string, active: boolean, onPress: () => void) {
    return <Pressable key={label} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} style={[styles.option, active && styles.selectedOption]}><Text style={[styles.optionText, active && styles.selectedOptionText]}>{label}</Text>{active && <Ionicons name="checkmark" size={18} color={COLORS.orange} />}</Pressable>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => router.canGoBack() ? router.back() : router.replace('/home')} style={styles.back}><Ionicons name="chevron-back" size={24} color={COLORS.text} /></Pressable>
          <View style={styles.searchBox}><Ionicons name="search-outline" size={19} color={COLORS.muted} /><TextInput accessibilityLabel="Search rentals" value={query} onChangeText={setQuery} placeholder="Search anything..." placeholderTextColor={COLORS.muted} style={styles.input} autoCorrect={false} returnKeyType="search" />{query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clear}><Ionicons name="close-circle" size={18} color={COLORS.muted} /></Pressable> : null}</View>
        </View>
        <View style={styles.categoryRow}>{CATEGORIES.map(name => <Pressable key={name} accessibilityRole="button" accessibilityState={{ selected: category === name }} onPress={() => setCategory(name)} style={[styles.chip, category === name && styles.activeChip]}><Text style={[styles.chipText, category === name && styles.activeChipText]}>{name}</Text></Pressable>)}</View>
        <View style={styles.filters}>
          <Pressable accessibilityRole="button" accessibilityLabel="Filter by distance" onPress={() => setPanel('distance')} style={styles.filter}><Text style={styles.filterText}>{distance ? `Within ${distance} mi` : 'Any distance'}</Text><Ionicons name="chevron-down" size={12} color={COLORS.muted} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Sort rentals" onPress={() => setPanel('sort')} style={[styles.filter, sort !== 'Recommended' && styles.filterActive]}><Text style={styles.filterText}>Sort</Text><Ionicons name="chevron-down" size={12} color={COLORS.muted} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Filter by price" onPress={() => setPanel('price')} style={[styles.filter, !!maxPrice && styles.filterActive]}><Text style={styles.filterText}>{maxPrice ? `≤ $${maxPrice}` : 'Price'}</Text><Ionicons name="chevron-down" size={12} color={COLORS.muted} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="All filters" onPress={() => setPanel('all')} style={[styles.filterIcon, savedOnly && styles.filterActive]}><Ionicons name="options-outline" size={21} color={COLORS.text} /></Pressable>
        </View>
        <FlatList
          data={results} keyExtractor={item => item.id} showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <View style={styles.row}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${item.name}, $${item.price} per day, view details`} onPress={() => setSelected(item)} style={({ pressed }) => [styles.listing, pressed && styles.pressed]}>
              <Image source={item.image} contentFit="cover" style={styles.thumbnail} />
              <View style={styles.details}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.price}>${item.price}<Text style={styles.perDay}>/day</Text></Text><View style={styles.meta}><Ionicons name="star" size={13} color="#F89B2C" /><Text style={styles.metaText}>{item.rating.toFixed(1)} ({item.reviews})</Text><Text style={styles.metaText}>•</Text><Text style={styles.metaText}>{item.distance} mi</Text></View></View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`${saved.includes(item.id) ? 'Unsave' : 'Save'} ${item.name}`} accessibilityState={{ selected: saved.includes(item.id) }} onPress={() => setSaved(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])} style={styles.heart}><Ionicons name={saved.includes(item.id) ? 'heart' : 'heart-outline'} size={22} color={saved.includes(item.id) ? COLORS.orange : COLORS.muted} /></Pressable>
          </View>}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={36} color={COLORS.muted} /><Text style={styles.emptyTitle}>No rentals found</Text><Text style={styles.body}>Try another search or adjust your filters.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(''); resetFilters(); }}><Text style={styles.reset}>Reset search</Text></Pressable></View>}
          ListFooterComponent={<Text style={styles.sample}>Sample listings and distances · Saved items last for this visit.</Text>}
        />
      </View>
      <Modal transparent visible={!!panel || !!selected} animationType="slide" onRequestClose={close}>
        <View style={styles.scrim}><Pressable accessibilityRole="button" accessibilityLabel="Close filters" onPress={close} style={StyleSheet.absoluteFill} />
          <SafeAreaView edges={['bottom']} style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{selected?.name ?? (panel === 'distance' ? 'Distance' : panel === 'sort' ? 'Sort by' : panel === 'price' ? 'Daily price' : 'Filters')}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.back} onPress={close}><Ionicons name="close" size={24} color={COLORS.text} /></Pressable></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected ? <><Image source={selected.image} contentFit="contain" style={styles.detailImage} /><Text style={styles.price}>${selected.price}/day</Text><Text style={styles.body}>{selected.category} · {selected.distance} mi away · Rated {selected.rating.toFixed(1)}</Text><Text style={styles.body}>This is a sample listing. Booking is not available yet.</Text></> : <>
                {(panel === 'all' || panel === 'distance') && <View style={styles.group}><Text style={styles.groupTitle}>Distance</Text>{[1,3,5,10,0].map(value => option(value ? `Within ${value} miles` : 'Any distance', distance === value, () => setDistance(value)))}</View>}
                {(panel === 'all' || panel === 'price') && <View style={styles.group}><Text style={styles.groupTitle}>Maximum price per day</Text>{[0,20,30,50].map(value => option(value ? `$${value} or less` : 'Any price', maxPrice === value, () => setMaxPrice(value)))}</View>}
                {(panel === 'all' || panel === 'sort') && <View style={styles.group}><Text style={styles.groupTitle}>Sort by</Text>{SORTS.map(value => option(value, sort === value, () => setSort(value)))}</View>}
                {panel === 'all' && <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: savedOnly }} style={styles.option} onPress={() => setSavedOnly(!savedOnly)}><Text style={styles.optionText}>Saved items only</Text><Ionicons name={savedOnly ? 'checkbox' : 'square-outline'} size={22} color={COLORS.orange} /></Pressable>}
              </>}
            </ScrollView>
            {!selected && <View style={styles.sheetFooter}><Pressable accessibilityRole="button" onPress={resetFilters} style={styles.resetButton}><Text style={styles.reset}>Reset</Text></Pressable><Pressable accessibilityRole="button" onPress={close} style={styles.applyButton}><Text style={styles.applyText}>Show {results.length} rentals</Text></Pressable></View>}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, container: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 6, gap: 4 }, back: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }, searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 24, paddingHorizontal: 12, gap: 8 }, input: { flex: 1, minHeight: 42, fontSize: 14, color: COLORS.text }, clear: { padding: 4 },
  categoryRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 }, chip: { flex: 1, minHeight: 36, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: COLORS.surface }, activeChip: { backgroundColor: COLORS.orange }, chipText: { fontSize: 12, color: '#666970' }, activeChipText: { color: COLORS.white, fontWeight: '600' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 12, alignItems: 'center' }, filter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 36, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 6 }, filterText: { fontSize: 12, color: '#62666C' }, filterIcon: { width: 36, height: 36, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, filterActive: { borderColor: COLORS.orange, backgroundColor: '#FFF0E8' },
  list: { paddingHorizontal: 20, paddingBottom: 16 }, row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 9, alignItems: 'flex-start' }, listing: { flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }, thumbnail: { width: 104, height: 82, borderRadius: 8, backgroundColor: COLORS.surface }, details: { flex: 1, gap: 4 }, itemName: { fontSize: 15, fontWeight: '600', color: COLORS.text }, price: { fontSize: 18, fontWeight: '700', color: COLORS.orange }, perDay: { fontSize: 15 }, meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' }, metaText: { fontSize: 11, color: COLORS.muted }, heart: { width: 36, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, pressed: { opacity: 0.65 }, sample: { fontSize: 10, color: COLORS.muted, lineHeight: 16, marginTop: 14 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 }, emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text }, body: { color: '#71757A', fontSize: 14, lineHeight: 22, marginVertical: 10 }, reset: { color: COLORS.orange, fontWeight: '600', fontSize: 14 },
  scrim: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' }, sheet: { maxHeight: '85%', width: '100%', maxWidth: 600, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 12, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8 }, sheetTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, flex: 1 }, group: { marginBottom: 20 }, groupTitle: { fontSize: 13, fontWeight: '600', color: COLORS.muted, marginBottom: 8 }, option: { padding: 14, minHeight: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, optionText: { fontSize: 15, color: COLORS.text }, selectedOption: { backgroundColor: '#FFE8DC' }, selectedOptionText: { color: COLORS.orange, fontWeight: '600' }, sheetFooter: { flexDirection: 'row', gap: 16, paddingVertical: 16, alignItems: 'center' }, resetButton: { padding: 12 }, applyButton: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 16, backgroundColor: COLORS.orange }, applyText: { color: 'white', fontWeight: '700' }, detailImage: { width: '100%', height: 240, borderRadius: 16, marginBottom: 12 },
});

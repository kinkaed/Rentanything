import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getListings, type Listing } from '@/services/listings';

const C = { bg: '#FAF7F0', text: '#17202D', muted: '#69727D', orange: '#FC5B2C', line: '#EAE4DA', card: '#FFFDFA' };
type Icon = ComponentProps<typeof Ionicons>['name'];
function Info({ icon, title, value }: { icon: Icon; title: string; value: string }) {
  return <View style={s.info}><Ionicons name={icon} size={24} color={C.orange} /><View style={s.flex}><Text style={s.infoTitle}>{title}</Text><Text style={s.body}>{value}</Text></View></View>;
}
function formatDate(value?: string) {
  if (!value) return 'Not specified';
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export default function ListingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    getListings().then(items => { if (active) { setListing(items.find(item => item.id === id) ?? null); setPhoto(0); } })
      .catch(() => { if (active) setError('Could not load this listing.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retry]));
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  const details = listing?.local?.details;
  const owner = listing?.local?.owner;
  const photos = details ? details.photos.map(uri => ({ uri })) : listing ? [listing.image] : [];
  const deposit = details ? Number(details.deposit || 0) : null;
  const dateRange = details ? `${formatDate(details.start)} – ${formatDate(details.end)}` : 'Availability not provided';
  return <SafeAreaView style={s.screen}><StatusBar style="dark" /><View style={s.shell}>
    <View style={s.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={s.circle}><Ionicons name="chevron-back" size={26} color={C.text} /></Pressable><Image source={require('@/assets/images/rent-it-logo.png')} contentFit="contain" style={s.logo} /><Pressable accessibilityRole="button" accessibilityLabel="Sharing information" onPress={() => setNotice('This listing is stored locally. A public share link will be available when publishing is connected.')} style={s.circle}><Ionicons name="share-outline" size={22} color={C.text} /></Pressable></View>
    {loading ? <ActivityIndicator color={C.orange} style={s.loading} /> : error || !listing ? <View style={s.empty}><Text style={s.title}>{error || 'Listing not found'}</Text><Text style={s.body}>Return to Home or select another listing.</Text>{!!error && <Pressable accessibilityRole="button" onPress={() => setRetry(value => value + 1)} style={s.button}><Text style={s.buttonText}>Try again</Text></Pressable>}</View> : <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.mainPhoto}><Image source={photos[photo]} contentFit="cover" style={StyleSheet.absoluteFill} accessibilityLabel={`${listing.name}, photo ${photo + 1}`} /><View style={s.counter}><Text style={s.counterText}>{photo + 1} / {photos.length}</Text></View></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.thumbnails}>{photos.map((source, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`View photo ${index + 1}`} accessibilityState={{ selected: photo === index }} onPress={() => setPhoto(index)} style={[s.thumbnail, photo === index && s.selected]}><Image source={source} contentFit="cover" style={s.thumbImage} /></Pressable>)}</ScrollView>
        <Text style={s.preview}>{details ? 'Your listing preview · Saved on this device · Not publicly published' : 'Sample listing · For preview only'}</Text>
        <Text style={s.title}>{listing.name}</Text><Text style={s.price}>${listing.price.toFixed(2)}<Text style={s.day}>/day</Text></Text>
        <View style={s.location}><Ionicons name="location-outline" size={18} color={C.muted} /><Text style={s.body}>{details?.location || 'Location not specified'}</Text></View>
        <View style={s.badges}><Text style={s.badge}>{listing.category}</Text><Text style={s.badge}>{details?.condition || 'Condition not specified'}</Text>{details && <Text style={s.badge}>{deposit ? 'Refundable deposit' : 'No deposit required'}</Text>}</View>
        <Text style={s.sectionTitle}>About this item</Text><Text style={s.description} numberOfLines={expanded ? undefined : 4}>{listing.description}</Text>{listing.description.length > 160 && <Pressable accessibilityRole="button" onPress={() => setExpanded(value => !value)}><Text style={s.link}>{expanded ? 'Show less' : 'Read more'}</Text></Pressable>}
        <View style={s.card}><Info icon="sparkles-outline" title="Condition" value={details?.condition || 'Not specified'} /><Info icon="shield-checkmark-outline" title="Refundable security deposit" value={deposit === null ? 'Not specified' : deposit ? `$${deposit.toFixed(2)} · Refundable after return` : 'No security deposit required'} /><Info icon="location-outline" title="Location" value={details?.location || 'Not specified'} /><Info icon="car-outline" title="Pickup / meetup" value={details ? details.pickup === 'home' ? 'Pickup at my location · Renter picks up the item' : 'Meet in a public place · Arrange the meeting point with the owner' : 'Not specified'} /></View>
        <View style={s.owner}><View style={s.avatar}>{owner?.avatar ? <Image source={{ uri: owner.avatar }} style={StyleSheet.absoluteFill} /> : <Ionicons name="person" size={28} color={C.muted} />}</View><View style={s.flex}><Text style={s.infoTitle}>{owner?.name || (details ? 'You' : 'Sample owner')}</Text>{!!owner?.handle && <Text style={s.body}>@{owner.handle}</Text>}<Text style={s.small}>Identity not verified</Text></View><Pressable accessibilityRole="button" style={s.outline} onPress={() => setNotice('Messaging will be available when user accounts are connected.')}><Text style={s.link}>Message owner</Text></Pressable></View>
        <View style={s.card}><Info icon="calendar-outline" title="Available dates" value={dateRange} /><Text style={s.small}>The full availability range entered by the owner is shown above.</Text></View>
        <View style={s.card}><Text style={s.sectionTitle}>House rules & tips</Text>{details?.tips.length ? details.tips.map((tip, index) => <View key={index} style={s.rule}><Ionicons name="checkmark-circle-outline" size={19} color={C.orange} /><Text style={s.ruleText}>{tip}</Text></View>) : <Text style={s.body}>No additional rules provided.</Text>}</View>
        <Text style={s.sectionTitle}>Reviews</Text><Text style={s.body}>No reviews for this listing yet.</Text>
      </ScrollView>
      <View style={s.bookingBar}><View style={s.flex}><Text style={s.bottomPrice}>${listing.price.toFixed(2)}/day</Text><Text style={s.small}>{deposit === null ? 'Deposit not specified' : `$${deposit.toFixed(2)} refundable deposit`}</Text></View><Pressable accessibilityRole="button" style={s.button} onPress={() => setNotice('Booking is not available in this local preview. No reservation or payment has been made.')}><Text style={s.buttonText}>Book Now</Text></Pressable></View>
    </>}
    <View style={s.navigation}>{([{ label: 'Home', icon: 'home-outline', route: '/home' }, { label: 'Search', icon: 'search-outline', route: '/search' }, { label: 'List', icon: 'add-circle', route: '/listing' }, { label: 'Bookings', icon: 'calendar-outline', route: '/booking' }, { label: 'Profile', icon: 'person-outline', route: '/profile' }] as const).map(tab => <Pressable key={tab.label} accessibilityRole="button" style={s.nav} onPress={() => tab.route ? router.push(tab.route) : setNotice('Your bookings will appear once booking is connected.')}><Ionicons name={tab.icon} size={tab.label === 'List' ? 33 : 23} color={tab.label === 'List' ? C.orange : C.text} /><Text style={s.navText}>{tab.label}</Text></Pressable>)}</View>
  </View><Modal transparent visible={!!notice} animationType="fade" onRequestClose={() => setNotice('')}><View style={s.scrim}><View style={s.dialog}><Text style={s.sectionTitle}>Listing preview</Text><Text style={s.description}>{notice}</Text><Pressable accessibilityRole="button" style={s.button} onPress={() => setNotice('')}><Text style={s.buttonText}>Got it</Text></Pressable></View></View></Modal></SafeAreaView>;
}
const s = StyleSheet.create({
 screen: { flex: 1, backgroundColor: C.bg }, shell: { flex: 1, maxWidth: 700, width: '100%', alignSelf: 'center' }, flex: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, justifyContent: 'space-between' }, circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' }, logo: { width: 155, height: 76 }, loading: { marginTop: 40 }, empty: { flex: 1, padding: 24, gap: 15 }, content: { paddingHorizontal: 18, paddingBottom: 24 }, mainPhoto: { width: '100%', aspectRatio: 1.3, borderRadius: 18, overflow: 'hidden', backgroundColor: '#EDE6D9' }, counter: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#00000080', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }, counterText: { color: 'white', fontSize: 12 }, thumbnails: { gap: 8, paddingVertical: 10 }, thumbnail: { width: 67, height: 62, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: 'transparent' }, selected: { borderColor: C.orange }, thumbImage: { width: '100%', height: '100%', borderRadius: 7 }, preview: { color: '#A0492B', backgroundColor: '#FFECE0', padding: 9, borderRadius: 8, fontSize: 10, lineHeight: 16, marginVertical: 8 }, title: { fontSize: 27, color: C.text, fontWeight: '700', marginBottom: 5 }, price: { fontSize: 25, fontWeight: '700', color: C.orange }, day: { fontSize: 19 }, location: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 8 }, body: { color: C.muted, fontSize: 13, lineHeight: 20, flexShrink: 1 }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginVertical: 13 }, badge: { fontSize: 11, color: C.text, borderWidth: 1, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14 }, sectionTitle: { color: C.text, fontSize: 17, fontWeight: '600', marginBottom: 8 }, description: { color: C.muted, fontSize: 14, lineHeight: 22, marginBottom: 9 }, link: { color: C.orange, fontSize: 12, fontWeight: '500' }, card: { padding: 15, backgroundColor: C.card, borderRadius: 17, marginVertical: 10, borderWidth: 1, borderColor: C.line }, info: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 }, infoTitle: { fontSize: 14, color: C.text, fontWeight: '600', marginBottom: 3 }, owner: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: 12, borderRadius: 17, backgroundColor: C.card, marginVertical: 8 }, avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEE7DD', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, outline: { padding: 10, borderWidth: 1, borderColor: C.orange, borderRadius: 12 }, small: { fontSize: 10, lineHeight: 16, color: C.muted }, rule: { flexDirection: 'row', gap: 8, marginVertical: 6 }, ruleText: { flex: 1, color: C.muted, fontSize: 13, lineHeight: 20 }, bookingBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card }, bottomPrice: { color: C.orange, fontSize: 20, fontWeight: '700' }, button: { paddingHorizontal: 22, paddingVertical: 15, backgroundColor: C.orange, borderRadius: 15, alignItems: 'center' }, buttonText: { color: 'white', fontWeight: '600', fontSize: 14 }, navigation: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, paddingVertical: 7, borderTopWidth: 1, borderTopColor: C.line }, nav: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 45, gap: 3 }, navText: { color: C.text, fontSize: 10 }, scrim: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#00000066' }, dialog: { width: '100%', maxWidth: 450, alignSelf: 'center', backgroundColor: C.bg, padding: 22, borderRadius: 20 },
});

import { getCreatedListings, type CreatedListing } from '@/services/created-listings';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ComponentProps } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyProfile, loadProfile, saveProfile, type LocalProfile } from '@/services/profile';
import { hasSavedDraft, loadDraft, retainPhoto, type ListingDraft } from '@/services/listing-draft';

const C = { bg: '#FAF7F0', text: '#17202D', muted: '#68717B', orange: '#FC5B2C', border: '#ECE5DB', peach: '#FFE9DE', card: '#FFFDFA' };
type Icon = ComponentProps<typeof Ionicons>['name'];
const MENU: { label: string; icon: Icon }[] = [
  { label: 'My Listings', icon: 'cube-outline' }, { label: 'My Bookings', icon: 'calendar-outline' },
  { label: 'Payments & Payouts', icon: 'card-outline' }, { label: 'Saved Items', icon: 'heart-outline' },
  { label: 'Messages', icon: 'chatbubble-outline' }, { label: 'Notifications', icon: 'notifications-outline' },
  { label: 'My Activity', icon: 'stats-chart-outline' }, { label: 'Settings', icon: 'settings-outline' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
];
const EMPTY_MESSAGES: Record<string, string> = {
  'My Bookings': 'Your rentals will appear here once booking is available.',
  'Payments & Payouts': 'Payments are not connected yet. No payment details have been collected.',
  'Saved Items': 'Saved rentals currently stay in your Search screen for that visit. Account-wide saved items are not connected yet.',
  Messages: 'Your conversations with renters and owners will appear here when messaging is connected.',
  Notifications: 'No notifications yet. Rental updates will appear here.',
  'My Activity': 'No account activity yet. Your rental history will appear here.',
  'Help & Support': 'To list an item, tap +, add photos and details, then save a draft. Find your saved draft under My Listings. Live support is not connected yet.',
  'Rent more. Waste less.': 'Give useful items more time in use. Renting and sharing can help you buy less and make more of what your community already owns.',
};
export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile>(emptyProfile);
  const [edit, setEdit] = useState<LocalProfile>(emptyProfile);
  const [created, setCreated] = useState<CreatedListing[]>([]);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [panel, setPanel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([getCreatedListings(), loadProfile(), hasSavedDraft().then(exists => exists ? loadDraft() : null)])
      .then(([previews, value, saved]) => { if (active) { setCreated(previews); setProfile(value); setDraft(saved); setError(''); } })
      .catch(() => { if (active) setError('Could not load your local profile or draft. Reopen this screen to retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));
  const openEdit = () => { setEdit(profile); setPanel('Edit Profile'); };
  async function updateAvatar() {
    if (busy || loading) return;
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.75 });
      if (!result.canceled) {
        const next = { ...profile, avatar: await retainPhoto(result.assets[0].uri) };
        await saveProfile(next); setProfile(next);
      }
    } catch { setError('Could not save your profile photo. Please try again.'); }
    finally { setBusy(false); }
  }
  async function commitProfile() {
    if (!edit.name.trim()) { setError('Enter your name before saving.'); return; }
    if (edit.handle && !/^@?[a-zA-Z0-9_]{1,30}$/.test(edit.handle.trim())) { setError('Use letters, numbers or underscores for your username (up to 30 characters).'); return; }
    setBusy(true);
    try {
      const next = { ...edit, name: edit.name.trim(), handle: edit.handle.trim().replace(/^@/, ''), location: edit.location.trim(), bio: edit.bio.trim() };
      await saveProfile(next); setProfile(next); setPanel(null); setError('');
    } catch { setError('Could not save your profile. Please try again.'); }
    finally { setBusy(false); }
  }
  return <SafeAreaView edges={['bottom']} style={s.screen}><StatusBar style="dark" /><View style={s.shell}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
      <View style={s.hero}><Image source={require('@/assets/images/splash-scenery.png')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" /><View style={s.wash} /><SafeAreaView edges={['top']}><View style={s.topbar}><Image source={require('@/assets/images/rent-it-logo.png')} style={s.logo} contentFit="contain" /><View style={s.topActions}><Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => setPanel('Notifications')} style={s.iconButton}><Ionicons name="notifications-outline" size={25} color={C.text} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => setPanel('Settings')} style={s.iconButton}><Ionicons name="settings-outline" size={25} color={C.text} /></Pressable></View></View></SafeAreaView><Text style={s.heroWords}>Good things{ '\n' }get shared.</Text></View>
      <View style={s.profileBody}>
        <View style={s.identityRow}><View style={s.avatarWrap}><View style={s.avatar}>{profile.avatar ? <Image source={{ uri: profile.avatar }} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Ionicons name="person" size={52} color="#AA8E74" />}</View><Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" disabled={busy || loading} onPress={updateAvatar} style={s.camera}>{busy ? <ActivityIndicator color={C.orange} /> : <Ionicons name="camera" size={20} color={C.text} />}</Pressable></View><Pressable accessibilityRole="button" disabled={loading || busy} onPress={openEdit} style={s.editButton}><Ionicons name="pencil-outline" size={18} color={C.orange} /><Text style={s.editText}>Edit Profile</Text></Pressable></View>
        {loading ? <ActivityIndicator color={C.orange} /> : <><Text style={s.name}>{profile.name || 'Your profile'}</Text><Text style={s.handle}>{profile.handle ? `@${profile.handle}` : 'Add your username'}</Text><View style={s.location}><Ionicons name="location" size={17} color={C.orange} /><Text style={s.body}>{profile.location || 'Add your location'}</Text></View><Text style={s.bio}>{profile.bio || 'Tell your neighbors about yourself and the things you love to share.'}</Text></>}
        <View style={s.stats}>{([{ icon: 'star', value: '—', label: 'Rating', detail: 'No reviews yet' }, { icon: 'people-outline', value: '0', label: 'Total rentals', detail: '' }, { icon: 'shield-checkmark-outline', value: 'Not verified', label: 'ID verification', detail: '' }, { icon: 'calendar-outline', value: 'Preview', label: 'Member since', detail: 'Not connected' }] as { icon: Icon; value: string; label: string; detail: string }[]).map(stat => <View style={s.stat} key={stat.label}><Ionicons name={stat.icon} size={25} color={C.orange} /><Text style={s.statValue}>{stat.value}</Text><Text style={s.statLabel}>{stat.label}</Text>{!!stat.detail && <Text style={s.statDetail}>{stat.detail}</Text>}</View>)}</View>
        <View style={s.menu}>{MENU.map((item, index) => <Pressable key={item.label} accessibilityRole="button" onPress={() => item.label === 'My Bookings' ? router.push('/booking') : setPanel(item.label)} style={[s.menuRow, index === MENU.length - 1 && { borderBottomWidth: 0 }]}><Ionicons name={item.icon} size={24} color={C.text} /><Text style={s.menuLabel}>{item.label}</Text>{item.label === 'My Listings' && <Text style={s.count}>{created.length + (draft ? 1 : 0)}</Text>}<Ionicons name="chevron-forward" size={19} color={C.muted} /></Pressable>)}</View>
        <Pressable accessibilityRole="button" onPress={() => setPanel('Rent more. Waste less.')} style={s.green}><Ionicons name="leaf-outline" size={34} color="#2F6438" /><View style={s.flex}><Text style={s.greenTitle}>Rent more. Waste less.</Text><Text style={s.body}>A greener tomorrow together.</Text></View><Ionicons name="chevron-forward" size={20} color="#2F6438" /></Pressable><Text style={s.note}>Profile changes and drafts are saved on this device. Account services are not connected yet.</Text>
      </View>
    </ScrollView>
    <View style={s.navigation}><Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={s.navItem}><Ionicons name="home-outline" size={24} color={C.text} /><Text style={s.navText}>Home</Text></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/search')} style={s.navItem}><Ionicons name="search-outline" size={24} color={C.text} /><Text style={s.navText}>Search</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Create listing" onPress={() => router.push('/listing')} style={s.plus}><Ionicons name="add" size={34} color="white" /></Pressable><Pressable accessibilityRole="button" onPress={() => router.push('/booking')} style={s.navItem}><Ionicons name="calendar-outline" size={24} color={C.text} /><Text style={s.navText}>Bookings</Text></Pressable><View accessibilityRole="tab" accessibilityState={{ selected: true }} style={s.navItem}><Ionicons name="person" size={24} color={C.orange} /><Text style={[s.navText, s.editText]}>Profile</Text><View style={s.indicator} /></View></View>
  </View>
  <Modal transparent visible={!!panel || !!error} animationType="slide" onRequestClose={() => { if (!busy) { setPanel(null); setError(''); } }}><KeyboardAvoidingView style={s.scrim} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><SafeAreaView edges={['bottom']} style={s.sheet}><View style={s.sheetHeading}><Text style={s.sheetTitle}>{error ? 'Please try again' : panel}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" disabled={busy} onPress={() => error ? setError('') : setPanel(null)} style={s.iconButton}><Ionicons name="close" size={24} color={C.text} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled">
    {error ? <Text style={s.bio}>{error}</Text> : panel === 'Edit Profile' ? <>{(['name', 'handle', 'location', 'bio'] as const).map(key => <View key={key} style={s.field}><Text style={s.fieldLabel}>{key === 'handle' ? 'Username' : key === 'bio' ? 'About you' : key === 'name' ? 'Full name' : 'Location'}</Text><TextInput accessibilityLabel={key} value={edit[key]} onChangeText={value => setEdit(current => ({ ...current, [key]: value }))} style={[s.input, key === 'bio' && s.bioInput]} multiline={key === 'bio'} maxLength={key === 'bio' ? 250 : key === 'handle' ? 31 : 80} autoCapitalize={key === 'handle' ? 'none' : 'sentences'} /></View>)}<Pressable accessibilityRole="button" disabled={busy} onPress={commitProfile} style={s.primary}><Text style={s.primaryText}>{busy ? 'Saving…' : 'Save profile'}</Text></Pressable></> : panel === 'My Listings' ? <>{!!created.length && <><Text style={s.fieldLabel}>Listing previews</Text>{created.map(item => <Pressable key={item.id} accessibilityRole="button" style={s.draftCard} onPress={() => { setPanel(null); router.push({ pathname: '/listing-details', params: { id: item.id } }); }}><Image source={{ uri: item.details.photos[0] }} style={s.draftPhoto} /><View style={s.flex}><Text style={s.fieldLabel}>{item.details.title}</Text><Text style={s.body}>${item.details.price}/day · Local preview</Text></View><Ionicons name="chevron-forward" size={20} /></Pressable>)}</>}<Text style={s.fieldLabel}>Drafts</Text>{loading ? <ActivityIndicator color={C.orange} /> : draft ? <Pressable accessibilityRole="button" onPress={() => { setPanel(null); router.push('/listing'); }} style={s.draftCard}>{draft.photos[0] ? <Image source={{ uri: draft.photos[0] }} style={s.draftPhoto} /> : <Ionicons name="cube-outline" size={38} color={C.orange} />}<View style={s.flex}><Text style={s.fieldLabel}>{draft.title || 'Untitled listing'}</Text><Text style={s.body}>{draft.category || 'No category yet'} · Draft</Text><Text style={s.editText}>Continue editing</Text></View><Ionicons name="chevron-forward" size={20} /></Pressable> : <><Text style={s.bio}>No saved drafts yet. Create a listing and tap Save draft to find it here.</Text><Pressable accessibilityRole="button" style={s.primary} onPress={() => { setPanel(null); router.push('/listing'); }}><Text style={s.primaryText}>Create a listing</Text></Pressable></>}<Text style={s.note}>Previews and the current draft are saved on this device. No listings have been publicly published.</Text></> : panel === 'Settings' ? <><Pressable accessibilityRole="button" onPress={openEdit} style={s.menuRow}><Text style={s.menuLabel}>Edit profile</Text><Ionicons name="chevron-forward" size={20} /></Pressable><Text style={s.bio}>You’re using a local preview. Account, security and notification preferences will be available once accounts are connected.</Text></> : <Text style={s.bio}>{EMPTY_MESSAGES[panel ?? '']}</Text>}
  </ScrollView></SafeAreaView></KeyboardAvoidingView></Modal></SafeAreaView>;
}
const s = StyleSheet.create({
 screen: { flex: 1, backgroundColor: C.bg }, shell: { flex: 1, maxWidth: 700, width: '100%', alignSelf: 'center' }, flex: { flex: 1 }, content: { paddingBottom: 18 }, hero: { height: 245, overflow: 'hidden' }, wash: { ...StyleSheet.absoluteFill, backgroundColor: '#FAF7F045' }, topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }, logo: { width: 160, height: 90 }, topActions: { flexDirection: 'row', gap: 8 }, iconButton: { width: 42, height: 44, alignItems: 'center', justifyContent: 'center' }, heroWords: { textAlign: 'right', fontStyle: 'italic', fontSize: 25, lineHeight: 29, color: '#38434A', marginRight: 26, marginTop: 4 }, profileBody: { backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -20, paddingHorizontal: 18, paddingBottom: 10 }, identityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -36, marginBottom: 12 }, avatarWrap: { width: 112, height: 112 }, avatar: { width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: C.bg, backgroundColor: '#E9DDCD', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, camera: { position: 'absolute', right: -2, bottom: 0, backgroundColor: C.card, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border }, editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.peach, padding: 12, borderRadius: 14, marginTop: 32 }, editText: { color: C.orange, fontSize: 13, fontWeight: '500' }, name: { fontSize: 25, fontWeight: '700', color: C.text }, handle: { fontSize: 14, color: C.muted, marginTop: 3 }, location: { flexDirection: 'row', gap: 5, alignItems: 'center', marginVertical: 8 }, body: { fontSize: 13, color: C.muted, lineHeight: 20 }, bio: { fontSize: 14, lineHeight: 22, color: C.muted, marginBottom: 18 }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }, stat: { flexGrow: 1, flexBasis: '22%', alignItems: 'center', backgroundColor: C.card, borderRadius: 15, borderWidth: 1, borderColor: C.border, paddingVertical: 14, paddingHorizontal: 4, gap: 4 }, statValue: { color: C.text, fontSize: 15, fontWeight: '700', textAlign: 'center' }, statLabel: { fontSize: 10, color: C.muted, textAlign: 'center' }, statDetail: { fontSize: 9, color: C.muted, textAlign: 'center' }, menu: { borderRadius: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }, menuRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border }, menuLabel: { flex: 1, fontSize: 15, color: C.text }, count: { fontSize: 12, color: C.muted }, green: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, backgroundColor: '#E8EEE4', marginTop: 20 }, greenTitle: { fontSize: 15, color: '#254A32', fontWeight: '500' }, note: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 13, marginBottom: 12 }, navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border }, navItem: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', gap: 4 }, navText: { fontSize: 10, color: C.text }, plus: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 }, indicator: { height: 2, width: 36, backgroundColor: C.orange, borderRadius: 2 },
 scrim: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }, sheet: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 20, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', width: '100%', maxWidth: 700, alignSelf: 'center' }, sheetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, sheetTitle: { fontSize: 21, fontWeight: '700', color: C.text }, field: { gap: 7, marginBottom: 16 }, fieldLabel: { fontSize: 14, fontWeight: '600', color: C.text }, input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, color: C.text, fontSize: 15, minHeight: 46 }, bioInput: { minHeight: 100, textAlignVertical: 'top' }, primary: { backgroundColor: C.orange, borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 15 }, primaryText: { color: 'white', fontWeight: '600', fontSize: 15 }, draftCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18 }, draftPhoto: { width: 65, height: 65, borderRadius: 10 },
});

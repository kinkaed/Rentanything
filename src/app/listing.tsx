import { createListingPreview } from '@/services/created-listings';
import AvailabilityCalendar from '@/components/availability-calendar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { emptyDraft, loadDraft, retainPhoto, saveDraft, validateDraft, type ListingDraft } from '@/services/listing-draft';

const COLORS = { background: '#FAF7F0', text: '#17202D', muted: '#727780', border: '#DCDAD4', orange: '#FC5B2C', peach: '#FFE9DE' };
const categories = ['Tools', 'Electronics', 'Outdoor', 'Events', 'Home', 'Sports', 'Party', 'Others'];
const conditions = ['Like new', 'Good', 'Fair'];
type Icon = ComponentProps<typeof Ionicons>['name'];
function Field({ title, icon, required, children }: { title: string; icon: Icon; required?: boolean; children: ReactNode }) {
  return <View style={styles.field}><View style={styles.labelRow}><Ionicons name={icon} size={21} color={COLORS.text} /><Text style={styles.label}>{title}{required && <Text style={styles.required}> *</Text>}</Text></View>{children}</View>;
}
export default function ListingScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [photoOptions, setPhotoOptions] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [panel, setPanel] = useState<'category' | 'condition' | 'dates' | 'tip' | 'leave' | null>(null);
  const [tip, setTip] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { let active = true; loadDraft().then(value => { if (active) setDraft(value); }).catch(() => { if (active) setMessage('Could not restore your saved draft. Please try reopening this screen.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  function change<K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) { setDraft(current => ({ ...current, [key]: value })); setDirty(true); }
  const back = () => router.canGoBack() ? router.back() : router.replace('/home');
  async function save(publish = false) {
    if (publish) { const error = validateDraft(draft); if (error) { setMessage(error); return; } }
    setBusy(true);
    try {
      await saveDraft(draft);
      setDirty(false);
      if (publish) {
        const id = await createListingPreview(draft);
        router.push({ pathname: '/listing-details', params: { id } });
      } else setMessage('Draft saved on this device. You can return here to continue.');
    }
    catch { setMessage('Could not save your draft. Your changes are still here; please try again.'); }
    finally { setBusy(false); }
  }
  async function addPhotos(source: 'camera' | 'library') {
    if (busy || draft.photos.length >= 10) return;
    setBusy(true);
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setMessage(permission.canAskAgain ? 'Camera access is needed to take a photo. Tap Take photo again and allow access, or choose an existing photo.' : 'Camera access is disabled. Enable camera access in your device settings for this app (Expo Go during preview), or choose an existing photo.');
          return;
        }
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.75, cameraType: ImagePicker.CameraType.back })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 10 - draft.photos.length, quality: 0.75 });
      if (!result.canceled) {
        const photos = await Promise.all(result.assets.slice(0, 10 - draft.photos.length).map(asset => retainPhoto(asset.uri)));
        setDraft(current => ({ ...current, photos: [...current.photos, ...photos].slice(0, 10) }));
        setDirty(true);
        setPhotoOptions(false);
      }
    } catch { setMessage(source === 'camera' ? 'Could not open the camera or save the photo. Check camera access and try again on a device with a camera.' : 'Could not add those photos. Please try selecting them again.'); }
    finally { setBusy(false); }
  }
  const input = (key: 'title' | 'description' | 'price' | 'deposit' | 'location', placeholder: string, maxLength?: number) => <TextInput accessibilityLabel={key} style={[styles.input, key === 'description' && styles.description]} value={draft[key]} onChangeText={value => change(key, value)} placeholder={placeholder} placeholderTextColor={COLORS.muted} maxLength={maxLength} multiline={key === 'description'} textAlignVertical={key === 'description' ? 'top' : 'center'} keyboardType={key === 'price' || key === 'deposit' ? 'decimal-pad' : 'default'} />;
  return <SafeAreaView style={styles.screen}><StatusBar style="dark" /><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><View style={styles.shell}>
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back" style={styles.back} onPress={() => dirty ? setPanel('leave') : back()}><Ionicons name="chevron-back" size={26} color={COLORS.text} /></Pressable><Text style={styles.title}>Create Listing</Text><Pressable accessibilityRole="button" disabled={busy || loading} onPress={() => save()} style={styles.save}><Ionicons name="document-text-outline" size={17} color={COLORS.text} /><Text style={styles.saveText}>Save draft</Text></Pressable></View>
    {loading ? <ActivityIndicator style={styles.loading} color={COLORS.orange} /> : <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>List your item and start earning. It’s quick and easy!</Text>
      <View style={styles.photoHeading}><View style={styles.cameraBadge}><Ionicons name="camera" size={24} color={COLORS.orange} /></View><View style={styles.flex}><Text style={styles.label}>Photos <Text style={styles.required}>*</Text></Text><Text style={styles.help}>Add clear photos from different angles.</Text></View><Text style={styles.help}>{draft.photos.length}/10</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {draft.photos.map((uri, index) => <View key={uri} style={styles.photo}><Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" /><Pressable accessibilityRole="button" accessibilityLabel={`Remove photo ${index + 1}`} onPress={() => change('photos', draft.photos.filter((_, i) => i !== index))} style={styles.remove}><Ionicons name="close" size={18} color={COLORS.text} /></Pressable></View>)}
        {draft.photos.length < 10 && <Pressable accessibilityRole="button" accessibilityLabel="Add photos" onPress={() => setPhotoOptions(value => !value)} disabled={busy} style={styles.addPhoto}>{busy ? <ActivityIndicator color={COLORS.orange} /> : <><Ionicons name="camera-outline" size={30} color={COLORS.text} /><Text style={styles.help}>Add photo</Text><Ionicons name="add" size={23} color={COLORS.text} /></>}</Pressable>}
      </ScrollView>
      {photoOptions && draft.photos.length < 10 && <View style={styles.photoChoices}>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => addPhotos('camera')} style={styles.photoChoice}><Ionicons name="camera-outline" size={22} color={COLORS.orange} /><Text style={styles.value}>Take photo</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => addPhotos('library')} style={styles.photoChoice}><Ionicons name="images-outline" size={22} color={COLORS.orange} /><Text style={styles.value}>Choose from library</Text></Pressable>
      </View>}
      <Field title="Item title" icon="pricetag-outline" required>{input('title', 'e.g. Canon EOS R6 Camera', 80)}<Text style={styles.counter}>{draft.title.length}/80</Text></Field>
      <View style={styles.columns}><View style={styles.flex}><Field title="Category" icon="grid-outline" required><Pressable accessibilityRole="button" onPress={() => setPanel('category')} style={styles.select}><Text style={styles.value}>{draft.category || 'Select category'}</Text><Ionicons name="chevron-down" size={16} /></Pressable></Field></View><View style={styles.flex}><Field title="Condition" icon="sparkles-outline" required><Pressable accessibilityRole="button" onPress={() => setPanel('condition')} style={styles.select}><Text style={styles.value}>{draft.condition || 'Select condition'}</Text><Ionicons name="chevron-down" size={16} /></Pressable></Field></View></View>
      <Field title="Description" icon="document-text-outline" required>{input('description', 'Describe your item, what is included, and what renters should know.', 500)}<Text style={styles.counter}>{draft.description.length}/500</Text></Field>
      <View style={styles.columns}><View style={styles.flex}><Field title="Price per day ($)" icon="pricetag-outline" required>{input('price', '0.00', 10)}<Text style={styles.help}>Set a competitive daily price.</Text></Field></View><View style={styles.flex}><Field title="Refundable deposit ($)" icon="shield-checkmark-outline">{input('deposit', '0.00', 10)}<Text style={styles.help}>Refunded after return.</Text></Field></View></View>
      <Field title="Location" icon="location-outline" required>{input('location', 'City or neighborhood', 120)}<Text style={styles.help}>This helps nearby people find your item.</Text></Field>
      <Field title="Availability" icon="calendar-outline" required><Pressable accessibilityRole="button" onPress={() => setPanel('dates')} style={styles.dateCard}><Ionicons name="calendar-outline" size={28} color={COLORS.text} /><View style={styles.flex}><Text style={styles.help}>Available dates</Text><Text style={styles.value}>{draft.start && draft.end ? `${draft.start} – ${draft.end}` : 'Choose your dates'}</Text><Text style={styles.help}>You can always edit this later.</Text></View><Ionicons name="chevron-forward" size={18} /></Pressable></Field>
      <Field title="Pickup / meetup options" icon="car-outline" required><View style={styles.options}>{(['home', 'public'] as const).map(value => <Pressable accessibilityRole="radio" accessibilityState={{ checked: draft.pickup === value }} key={value} onPress={() => change('pickup', value)} style={[styles.pickup, draft.pickup === value && styles.picked]}><Ionicons name={draft.pickup === value ? 'radio-button-on' : 'radio-button-off'} size={20} color={draft.pickup === value ? COLORS.orange : COLORS.muted} /><Ionicons name={value === 'home' ? 'home-outline' : 'location-outline'} size={24} color={draft.pickup === value ? COLORS.orange : COLORS.text} /><View style={styles.flex}><Text style={styles.value}>{value === 'home' ? 'Pickup at my location' : 'Meet in a public place'}</Text><Text style={styles.help}>{value === 'home' ? 'Renter picks up the item' : 'e.g. coffee shop, mall'}</Text></View></Pressable>)}</View></Field>
      <Field title="House rules & tips" icon="document-text-outline"><Text style={styles.help}>Add a few helpful tips to set expectations (optional).</Text><View style={styles.tips}>{draft.tips.map((value, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Remove tip: ${value}`} style={styles.tip} onPress={() => change('tips', draft.tips.filter((_, i) => i !== index))}><Text style={styles.tipText}>{value}</Text><Ionicons name="close" size={16} color={COLORS.orange} /></Pressable>)}{draft.tips.length < 10 && <Pressable accessibilityRole="button" style={styles.tip} onPress={() => { setTip(''); setPanel('tip'); }}><Ionicons name="add" size={18} color={COLORS.text} /><Text>Add tip</Text></Pressable>}</View></Field>
      <Pressable accessibilityRole="button" disabled={busy} style={[styles.publish, busy && { opacity: 0.6 }]} onPress={() => save(true)}><Ionicons name="paper-plane-outline" size={23} color="white" /><Text style={styles.publishText}>{busy ? 'Saving…' : 'Preview Listing'}</Text></Pressable>
      <Text style={styles.footer}>Drafts and listing previews are saved on this device. Public publishing is not available yet.</Text>
    </ScrollView>}
  </View></KeyboardAvoidingView>
  <Modal visible={!!panel || !!message} transparent animationType="fade" onRequestClose={() => { setPanel(null); setMessage(''); }}><KeyboardAvoidingView style={styles.scrim} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.modal}><ScrollView keyboardShouldPersistTaps="handled"><View style={styles.modalHeader}><Text style={styles.modalTitle}>{message ? 'Your listing' : panel === 'dates' ? 'Availability' : panel === 'tip' ? 'Add a tip' : panel === 'leave' ? 'Unsaved changes' : panel === 'category' ? 'Category' : 'Condition'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.back} onPress={() => { setPanel(null); setMessage(''); }}><Ionicons name="close" size={23} /></Pressable></View>
    {message ? <Text style={styles.modalBody}>{message}</Text> : panel === 'category' || panel === 'condition' ? (panel === 'category' ? categories : conditions).map(value => <Pressable accessibilityRole="button" key={value} style={styles.choice} onPress={() => { change(panel, value); setPanel(null); }}><Text style={styles.value}>{value}</Text>{draft[panel] === value && <Ionicons name="checkmark" size={20} color={COLORS.orange} />}</Pressable>) : panel === 'dates' ? <AvailabilityCalendar start={draft.start} end={draft.end} onConfirm={(start, end) => { setDraft(current => ({ ...current, start, end })); setDirty(true); setPanel(null); }} /> : panel === 'tip' ? <><TextInput accessibilityLabel="House rule or tip" placeholder="e.g. Handle with care" style={styles.input} value={tip} onChangeText={setTip} maxLength={80} /><Pressable accessibilityRole="button" disabled={!tip.trim()} style={styles.publish} onPress={() => { if (tip.trim()) { change('tips', [...draft.tips, tip.trim()]); setPanel(null); } }}><Text style={styles.publishText}>Add tip</Text></Pressable></> : <><Text style={styles.modalBody}>Save your draft before leaving to keep your latest changes.</Text><Pressable accessibilityRole="button" style={styles.choice} onPress={() => setPanel(null)}><Text>Keep editing</Text></Pressable><Pressable accessibilityRole="button" style={styles.choice} onPress={back}><Text style={styles.required}>Leave without saving</Text></Pressable></>}
  </ScrollView></View></KeyboardAvoidingView></Modal></SafeAreaView>;
}
const styles = StyleSheet.create({
  photoChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  photoChoice: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.peach },
  screen: { flex: 1, backgroundColor: COLORS.background }, flex: { flex: 1 }, shell: { flex: 1, width: '100%', maxWidth: 700, alignSelf: 'center' }, loading: { marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10 }, back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1EEE8', alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, textAlign: 'center', fontSize: 21, fontWeight: '700', color: COLORS.text }, save: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 22, paddingHorizontal: 9, minHeight: 36 }, saveText: { color: COLORS.text, fontSize: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 30 }, subtitle: { color: COLORS.muted, textAlign: 'center', fontSize: 13, lineHeight: 19, marginBottom: 24 }, photoHeading: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 12 }, cameraBadge: { width: 42, height: 42, backgroundColor: COLORS.peach, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, photos: { gap: 10, paddingBottom: 22 }, photo: { width: 112, height: 122, borderRadius: 12, overflow: 'hidden' }, remove: { position: 'absolute', right: 5, top: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFFEE', alignItems: 'center', justifyContent: 'center' }, addPhoto: { width: 112, height: 122, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F4F1EB' },
  field: { marginBottom: 21, gap: 7 }, labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, label: { fontSize: 14, fontWeight: '600', color: COLORS.text, flexShrink: 1 }, required: { color: COLORS.orange }, input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, minHeight: 46, color: COLORS.text, fontSize: 14, backgroundColor: '#FFFFFF30' }, description: { minHeight: 118, lineHeight: 21 }, counter: { alignSelf: 'flex-end', color: COLORS.muted, fontSize: 11 }, columns: { flexDirection: 'row', gap: 14 }, select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 11, minHeight: 46 }, value: { color: COLORS.text, fontSize: 13, flexShrink: 1, lineHeight: 20 }, help: { color: COLORS.muted, fontSize: 11, lineHeight: 17 }, dateCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 13 }, options: { gap: 10 }, pickup: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border, padding: 13, borderRadius: 14 }, picked: { borderColor: COLORS.orange, backgroundColor: '#FFF1E8' }, tips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }, tip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: COLORS.peach, paddingHorizontal: 12, paddingVertical: 10 }, tipText: { color: '#A63718', fontSize: 12, flexShrink: 1 }, publish: { backgroundColor: COLORS.orange, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 20, padding: 17, marginTop: 12 }, publishText: { color: 'white', fontSize: 17, fontWeight: '600' }, footer: { fontSize: 11, color: COLORS.muted, textAlign: 'center', lineHeight: 17, marginTop: 12 },
  scrim: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 }, modal: { backgroundColor: COLORS.background, padding: 20, borderRadius: 22, maxHeight: '85%', width: '100%', maxWidth: 500, alignSelf: 'center' }, modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text }, modalBody: { fontSize: 15, lineHeight: 23, color: COLORS.muted, marginBottom: 12 }, choice: { paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border }, dateLabel: { color: COLORS.text, marginVertical: 10 },
});

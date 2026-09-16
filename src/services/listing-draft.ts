import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type ListingDraft = {
  title: string; category: string; condition: string; description: string;
  price: string; deposit: string; location: string; start: string; end: string;
  pickup: 'home' | 'public'; tips: string[]; photos: string[];
};
export function emptyDraft(): ListingDraft {
  return { title: '', category: '', condition: '', description: '', price: '', deposit: '', location: '', start: '', end: '', pickup: 'home', tips: [], photos: [] };
}
const KEY = 'rent-it.listing-draft.v1';
export async function hasSavedDraft(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) !== null;
}
export async function loadDraft(): Promise<ListingDraft> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return emptyDraft();
  const value = JSON.parse(raw);
  const initial = emptyDraft();
  for (const key of ['title', 'category', 'condition', 'description', 'price', 'deposit', 'location', 'start', 'end'] as const) {
    if (typeof value[key] === 'string') initial[key] = value[key];
  }
  initial.pickup = value.pickup === 'public' ? 'public' : 'home';
  initial.tips = Array.isArray(value.tips) ? value.tips.filter((v: unknown) => typeof v === 'string').slice(0, 10) : [];
  initial.photos = Array.isArray(value.photos) ? value.photos.filter((v: unknown) => typeof v === 'string').slice(0, 10) : [];
  return initial;
}
export async function saveDraft(draft: ListingDraft) {
  await AsyncStorage.setItem(KEY, JSON.stringify(draft));
}
export async function retainPhoto(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not save photo.'));
      reader.readAsDataURL(blob);
    });
  }
  const directory = new Directory(Paths.document, 'listing-photos');
  directory.create({ idempotent: true, intermediates: true });
  const extension = uri.split('?')[0].match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '.jpg';
  const target = new File(directory, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  new File(uri).copy(target);
  return target.uri;
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateDraft(draft: ListingDraft): string | null {
  if (!draft.photos.length) return 'Add at least one photo of your item.';
  if (!draft.title.trim() || !draft.category || !draft.condition || !draft.description.trim() || !draft.location.trim()) return 'Complete the title, category, condition, description and location.';
  if (!/^\d+(\.\d{1,2})?$/.test(draft.price) || Number(draft.price) <= 0) return 'Enter a daily price greater than zero (up to two decimal places).';
  if (draft.deposit && !/^\d+(\.\d{1,2})?$/.test(draft.deposit)) return 'Enter a valid refundable deposit, or leave it blank.';
  if (!validDate(draft.start) || !validDate(draft.end) || draft.end < draft.start) return 'Enter valid availability dates with the end on or after the start.';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if (draft.start < today) return 'Availability must start today or later.';
  return null;
}

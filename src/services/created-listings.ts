import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateDraft, type ListingDraft } from './listing-draft';
import { loadProfile, type LocalProfile } from './profile';

export type CreatedListing = { id: string; createdAt: string; details: ListingDraft; owner: LocalProfile };
const KEY = 'rent-it.created-listings.v1';
export async function getCreatedListings(): Promise<CreatedListing[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
export async function createListingPreview(details: ListingDraft): Promise<string> {
  const error = validateDraft(details);
  if (error) throw new Error(error);
  const listings = await getCreatedListings();
  // Reopening the same unchanged form should not create duplicate previews.
  const existing = listings.find(item => JSON.stringify(item.details) === JSON.stringify(details));
  if (existing) return existing.id;
  const record: CreatedListing = { id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), details, owner: await loadProfile() };
  await AsyncStorage.setItem(KEY, JSON.stringify([record, ...listings]));
  return record.id;
}

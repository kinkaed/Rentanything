import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocalProfile = { name: string; handle: string; location: string; bio: string; avatar: string };
export function emptyProfile(): LocalProfile { return { name: '', handle: '', location: '', bio: '', avatar: '' }; }
const KEY = 'rent-it.profile.v1';
export async function loadProfile(): Promise<LocalProfile> {
  const raw = await AsyncStorage.getItem(KEY);
  const value = raw ? JSON.parse(raw) : {};
  const profile = emptyProfile();
  for (const key of Object.keys(profile) as (keyof LocalProfile)[]) {
    if (typeof value[key] === 'string') profile[key] = value[key];
  }
  return profile;
}
export async function saveProfile(profile: LocalProfile) { await AsyncStorage.setItem(KEY, JSON.stringify(profile)); }

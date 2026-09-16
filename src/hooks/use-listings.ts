import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getListings, type Listing } from '@/services/listings';

export function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getListings().then(data => {
      if (active) setListings(data);
    }).catch(() => {
      if (active) setError('Unable to load rentals.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [revision]));

  return { listings, loading, error, reload: () => setRevision(value => value + 1) };
}

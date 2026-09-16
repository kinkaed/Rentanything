import { getCreatedListings, type CreatedListing } from './created-listings';
import samples from '@/data/listings.sample.json';

export interface Listing {
  local?: CreatedListing;
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  distance: number;
  description: string;
  featured: boolean;
  image: number | { uri: string };
}

// Metro requires literal paths for bundled preview assets. Database photos can
// use { uri: uploadedPhotoUrl } instead; screens support both sources.
const previewImages: Record<string, number> = {
  'home-washer': require('@/assets/images/home-washer.png'),
  'home-camera': require('@/assets/images/home-camera.png'),
  'search-tent': require('@/assets/images/search-tent.png'),
  'search-drill': require('@/assets/images/search-drill.png'),
  'search-speaker': require('@/assets/images/search-speaker.png'),
  'search-bike': require('@/assets/images/search-bike.png'),
  'search-projector': require('@/assets/images/search-projector.png'),
};

// Replace this implementation with the database/API query when configured.
// Keep the Promise<Listing[]> contract so Home and Search need no data rewrite.
export async function getListings(): Promise<Listing[]> {
  const created = await getCreatedListings();
  const local: Listing[] = created.map(record => ({ id: record.id, name: record.details.title, category: record.details.category, price: Number(record.details.price), rating: 0, reviews: 0, distance: 0, description: record.details.description, featured: true, image: { uri: record.details.photos[0] }, local: record }));
  return [...local, ...samples.map(({ imageKey, ...listing }) => ({
    ...listing,
    image: previewImages[imageKey],
  }))];
}

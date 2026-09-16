import samples from '@/data/bookings.sample.json';
import { getListings, type Listing } from './listings';

export type BookingStatus = 'Confirmed' | 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled';
export type BookingTab = 'Upcoming' | 'Past' | 'Cancelled';
export type Booking = {
  id: string; listing: Listing; status: BookingStatus; start: string; end: string;
  days: number; total: number; owner: string; location: string; isSample: boolean;
};
function dateAt(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function bookingTab(status: BookingStatus): BookingTab {
  return status === 'Cancelled' ? 'Cancelled' : status === 'Completed' ? 'Past' : 'Upcoming';
}
// Replace the sample source with the signed-in user's bookings API when connected.
export async function getBookings(): Promise<Booking[]> {
  const listings = await getListings();
  return samples.flatMap(sample => {
    const listing = listings.find(item => item.id === sample.listingId);
    return listing ? [{ id: sample.id, listing, status: sample.status as BookingStatus,
      start: dateAt(sample.startOffset), end: dateAt(sample.startOffset + sample.days),
      days: sample.days, total: Number((listing.price * sample.days).toFixed(2)),
      owner: sample.owner, location: sample.location, isSample: true }] : [];
  });
}
export function filterBookings(items: Booking[], tab: BookingTab, query: string, status: string, sort: string) {
  const text = query.trim().toLowerCase();
  return items.filter(item => bookingTab(item.status) === tab &&
    (!text || `${item.listing.name} ${item.owner} ${item.location}`.toLowerCase().includes(text)) &&
    (status === 'All statuses' || item.status === status))
    .sort((a, b) => sort === 'Total: low to high' ? a.total - b.total : sort === 'Total: high to low' ? b.total - a.total : tab === 'Upcoming' ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start));
}

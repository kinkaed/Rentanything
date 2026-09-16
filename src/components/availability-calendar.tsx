import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function parseDate(value: string) {
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return dateKey(date) === value ? date : null;
}
export default function AvailabilityCalendar({ start, end, onConfirm }: { start: string; end: string; onConfirm: (start: string, end: string) => void }) {
  const today = dateKey(new Date());
  const initial = parseDate(start);
  const validStart = initial && start >= today ? start : '';
  const [from, setFrom] = useState(validStart);
  const [until, setUntil] = useState(validStart && parseDate(end) && end >= validStart ? end : '');
  const [choosing, setChoosing] = useState<'start' | 'end'>(validStart ? 'end' : 'start');
  const [month, setMonth] = useState(() => {
    const date = validStart ? initial! : new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const previous = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const canGoBack = dateKey(new Date(month.getFullYear(), month.getMonth(), 0)) >= today;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((month.getDay() + count) / 7) * 7 }, (_, i) => {
    const day = i - month.getDay() + 1;
    return day > 0 && day <= count ? new Date(month.getFullYear(), month.getMonth(), day) : null;
  });
  function select(value: string) {
    if (choosing === 'start' || !from || value < from) {
      setFrom(value); setUntil(''); setChoosing('end');
    } else { setUntil(value); setChoosing('start'); }
  }
  return <View>
    <View style={styles.summary}>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose start date" onPress={() => setChoosing('start')} style={[styles.summaryBox, choosing === 'start' && styles.active]}><Text style={styles.muted}>From</Text><Text style={styles.value}>{from || 'Start date'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose end date" onPress={() => setChoosing('end')} style={[styles.summaryBox, choosing === 'end' && styles.active]}><Text style={styles.muted}>Until</Text><Text style={styles.value}>{until || 'End date'}</Text></Pressable>
    </View>
    <View style={styles.heading}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous month" disabled={!canGoBack} onPress={() => setMonth(previous)} style={styles.arrow}><Ionicons name="chevron-back" size={22} color={canGoBack ? '#17202D' : '#D4D0C9'} /></Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.month}>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Next month" onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} style={styles.arrow}><Ionicons name="chevron-forward" size={22} color="#17202D" /></Pressable>
    </View>
    <View style={styles.grid}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={index} style={styles.weekday}>{day}</Text>)}</View>
    <View style={styles.grid}>{cells.map((date, index) => {
      if (!date) return <View key={`blank-${index}`} style={styles.day} />;
      const value = dateKey(date), disabled = value < today, selected = value === from || value === until;
      const between = !!from && !!until && value > from && value < until;
      return <Pressable key={value} accessibilityRole="button" accessibilityLabel={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => select(value)} style={[styles.day, between && styles.range, selected && styles.selected]}><Text style={[styles.dayText, value === today && styles.today, disabled && styles.disabled, selected && styles.selectedText]}>{date.getDate()}</Text></Pressable>;
    })}</View>
    <Text style={styles.hint}>{choosing === 'end' ? 'Tap your last available day. Tap the start again for one day.' : 'Tap your first available day to start a new range.'}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !from || !until }} disabled={!from || !until} onPress={() => onConfirm(from, until)} style={[styles.done, (!from || !until) && styles.dim]}><Text style={styles.doneText}>Save dates</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 10, marginBottom: 12 }, summaryBox: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#DCDAD4', borderRadius: 10, gap: 4 }, active: { borderColor: '#FC5B2C', backgroundColor: '#FFF1E8' }, muted: { fontSize: 12, color: '#727780' }, value: { fontSize: 13, color: '#17202D' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, arrow: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }, month: { fontSize: 16, fontWeight: '600', color: '#17202D' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.285714%', textAlign: 'center', paddingVertical: 8, fontSize: 12, color: '#727780' }, day: { width: '14.285714%', height: 42, justifyContent: 'center', alignItems: 'center', borderRadius: 8 }, dayText: { fontSize: 14, color: '#17202D' }, today: { fontWeight: '700', textDecorationLine: 'underline' }, disabled: { color: '#C9C5BE' }, range: { backgroundColor: '#FFE9DE' }, selected: { backgroundColor: '#FC5B2C' }, selectedText: { color: 'white', fontWeight: '700' }, hint: { fontSize: 12, lineHeight: 18, color: '#727780', marginTop: 14 }, done: { backgroundColor: '#FC5B2C', padding: 15, alignItems: 'center', borderRadius: 16, marginTop: 16 }, dim: { opacity: 0.45 }, doneText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CalendarGridProps {
  days: { day: string; isToday?: boolean; otherMonth?: boolean; hasEvent?: boolean }[];
  weekdayLabels?: string[];
}

const defaultWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarGrid = ({ days, weekdayLabels = defaultWeekdays }: CalendarGridProps) => {
  const { theme } = useTheme();

  return (
    <View>
      <View style={styles.dow}>
        {weekdayLabels.map(d => (
          <Text key={d} style={[styles.dowText, { color: theme.faint }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((d, i) => (
          <View
            key={i}
            style={[
              styles.day,
              d.isToday && { backgroundColor: theme.violet, shadowColor: 'rgba(124,58,237,0.5)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 14, elevation: 3 },
            ]}
          >
            <Text style={[styles.dayText, { color: d.isToday ? '#fff' : d.otherMonth ? theme.faint : theme.muted }]}>{d.day}</Text>
            {d.hasEvent && <View style={[styles.event, { backgroundColor: d.isToday ? '#fff' : theme.blue }]} />}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  dowText: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: { fontSize: 12, fontWeight: '600' },
  event: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2 },
});

export default CalendarGrid;

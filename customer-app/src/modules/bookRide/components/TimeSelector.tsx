import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { shadowSm } from '../../../theme/shadows';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatDayLabel(d: Date, index: number) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function buildTimeSlots(day: Date): Date[] {
  const base = startOfDay(day);
  const slots: Date[] = [];
  const now = new Date();
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      const slot = new Date(base);
      slot.setHours(h, m, 0, 0);
      if (slot.getTime() > now.getTime()) {
        slots.push(slot);
      }
    }
  }
  return slots;
}

export default function TimeSelector({ value, onChange }: Props) {
  const dayOptions = useMemo(() => {
    const days: Date[] = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const vDay = startOfDay(value).getTime();
    const idx = dayOptions.findIndex((d) => startOfDay(d).getTime() === vDay);
    return idx >= 0 ? idx : 0;
  });

  const selectedDay = dayOptions[selectedDayIndex] ?? dayOptions[0];
  const slots = useMemo(() => buildTimeSlots(selectedDay), [selectedDay]);

  function selectDay(index: number) {
    setSelectedDayIndex(index);
    const newSlots = buildTimeSlots(dayOptions[index]);
    if (newSlots[0]) onChange(newSlots[0]);
  }

  function isSameSlot(a: Date, b: Date) {
    return a.getTime() === b.getTime();
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Select date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        {dayOptions.map((day, index) => {
          const active = index === selectedDayIndex;
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayChip, active && styles.dayChipActive]}
              onPress={() => selectDay(index)}
            >
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                {formatDayLabel(day, index)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Select time</Text>
      {slots.length === 0 ? (
        <Text style={styles.empty}>No slots left today — pick another day.</Text>
      ) : (
        <View style={styles.timeGrid}>
          {slots.map((slot) => {
            const active = isSameSlot(slot, value);
            return (
              <TouchableOpacity
                key={slot.toISOString()}
                style={[styles.timeChip, active && styles.timeChipActive]}
                onPress={() => onChange(slot)}
              >
                <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                  {slot.toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={[styles.summary, shadowSm]}>
        <Text style={styles.summaryLabel}>Pickup scheduled for</Text>
        <Text style={styles.summaryValue}>
          {value.toLocaleString(undefined, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  dayScroll: {
    marginBottom: spacing.sm,
  },
  dayChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayChipTextActive: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.white,
    minWidth: '30%',
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.accent,
  },
  timeChipText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeChipTextActive: {
    color: colors.buttonPrimaryText,
  },
  empty: {
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  summaryLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.primary,
  },
});

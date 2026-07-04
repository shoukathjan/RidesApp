import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../theme/components';

interface Earnings {
  today: number;
  week: number;
  total: number;
  completedRides: number;
}

export default function EarningsScreen() {
  const [data, setData] = useState<Earnings | null>(null);

  useEffect(() => {
    api.get<Earnings>('/driver/earnings').then((r) => setData(r.data));
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Earnings" subtitle="You keep the full fare" />
      <View style={styles.body}>
        <Stat label="Today" value={data ? `₹${data.today}` : '—'} />
        <Stat label="This week" value={data ? `₹${data.week}` : '—'} />
        <Stat label="Total" value={data ? `₹${data.total}` : '—'} />
        <Stat label="Completed rides" value={data ? String(data.completedRides) : '—'} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: { color: colors.textMuted },
  value: { fontSize: typography.title, fontWeight: '700', color: colors.primary, marginTop: 4 },
});

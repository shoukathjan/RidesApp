import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api/client';
import { colors, spacing, typography } from '../../theme';
import { ScreenHeader } from '../../theme/components';
import { getSocket } from '../../realtime/socket';
import { SocketEvents } from '@useme/shared';

interface Note {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsScreen() {
  const [notes, setNotes] = useState<Note[]>([]);

  function load() {
    api.get<Note[]>('/notifications').then((r) => setNotes(r.data));
  }

  useEffect(() => {
    load();
    const socket = getSocket();
    socket?.on(SocketEvents.NOTIFICATION, load);
    return () => {
      socket?.off(SocketEvents.NOTIFICATION, load);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" />
      <FlatList
        contentContainerStyle={{ padding: spacing.lg }}
        data={notes}
        keyExtractor={(n) => n._id}
        ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: { fontWeight: '700', color: colors.textPrimary, fontSize: typography.subtitle },
  body: { color: colors.textMuted, marginTop: 4 },
});

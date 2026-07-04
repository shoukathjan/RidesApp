import type { ComponentProps } from 'react';
import { VehicleType, VEHICLE_TYPES, VehicleTypeLabel } from '@useme/shared';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import { shadowSm } from '../../../theme/shadows';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const VEHICLE_ICONS: Record<VehicleType, IconName> = {
  [VehicleType.AUTO]: 'rickshaw',
  [VehicleType.BIKE]: 'motorbike',
  [VehicleType.CAR]: 'car-side',
  [VehicleType.TRUCK]: 'truck',
};

interface Props {
  value: VehicleType;
  onChange: (type: VehicleType) => void;
}

export default function VehicleSelector({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {VEHICLE_TYPES.map((type) => {
        const selected = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.card, shadowSm, selected && styles.cardSelected]}
            onPress={() => onChange(type)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
              <MaterialCommunityIcons
                name={VEHICLE_ICONS[type]}
                size={32}
                color={selected ? colors.white : colors.primary}
              />
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {VehicleTypeLabel[type]}
            </Text>
            {selected ? (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>Selected</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
    minHeight: 130,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  iconWrapSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '800',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
});

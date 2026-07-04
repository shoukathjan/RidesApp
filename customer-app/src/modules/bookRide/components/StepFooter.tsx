import { ReactNode, useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../theme';
import { PrimaryButton, SecondaryButton } from '../../../theme/components';

interface Props {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  loading?: boolean;
  nextDisabled?: boolean;
  children?: ReactNode;
}

export default function StepFooter({
  onBack,
  onNext,
  nextLabel,
  loading,
  nextDisabled,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomPad = keyboardOpen ? spacing.xs : Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      {children}
      <View style={styles.row}>
        {onBack ? (
          <View style={styles.backBtn}>
            <SecondaryButton title="Back" onPress={onBack} disabled={loading} compact />
          </View>
        ) : null}
        <View style={styles.nextBtn}>
          <PrimaryButton
            title={nextLabel}
            onPress={onNext}
            loading={loading}
            disabled={nextDisabled}
            compact
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderDefault,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
  },
  nextBtn: {
    flex: 2,
  },
});

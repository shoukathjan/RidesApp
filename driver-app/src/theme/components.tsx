import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Button,
  InputAccessoryView,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../config/AppConfigContext';
import { radii, spacing, typography } from './index';
import { shadowMd, shadowSm } from './shadows';

function headerTopPadding(insets: { top: number }, compact?: boolean) {
  const extra = compact ? spacing.xs : spacing.md;
  if (Platform.OS === 'android') {
    return (StatusBar.currentHeight ?? 0) + extra;
  }
  return insets.top + extra;
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  compact,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <TouchableOpacity
      style={[
        styles.button,
        shadowSm,
        { backgroundColor: theme.buttonPrimary },
        compact && styles.buttonCompact,
        (disabled || loading) && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color={theme.buttonPrimaryText} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { color: theme.buttonPrimaryText },
            compact && styles.buttonTextCompact,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title,
  onPress,
  disabled,
  compact,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        { borderColor: theme.primary, backgroundColor: theme.background },
        compact && styles.secondaryButtonCompact,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          { color: theme.primary },
          compact && styles.buttonTextCompact,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  compact,
}: {
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.primary },
        compact && styles.headerCompact,
        shadowSm,
        { paddingTop: headerTopPadding(insets, compact) },
      ]}
    >
      <Text
        style={[
          styles.headerTitle,
          { color: '#FFFFFF' },
          compact && styles.headerTitleCompact,
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.headerSubtitle,
            { color: '#FFFFFF' },
            compact && styles.headerSubtitleCompact,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SurfaceCard({
  children,
  style,
  elevated,
}: {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <View
      style={[
        styles.surfaceCard,
        {
          backgroundColor: theme.background,
          borderColor: theme.borderDefault,
        },
        elevated ? shadowMd : shadowSm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export const PHONE_KEYBOARD_ACCESSORY_ID = 'useme-phone-keyboard-done';

export function PhoneKeyboardAccessory() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={PHONE_KEYBOARD_ACCESSORY_ID}>
      <View style={styles.keyboardAccessory}>
        <Button title="Done" onPress={Keyboard.dismiss} />
      </View>
    </InputAccessoryView>
  );
}

export function PhoneInput({
  value,
  onChangeText,
  ...rest
}: TextInputProps & { value: string; onChangeText: (t: string) => void }) {
  const theme = useThemeColors();
  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(digits);
    if (digits.length === 10) Keyboard.dismiss();
  }

  return (
    <View style={[styles.phoneRow, { borderColor: theme.borderFocused }]}>
      <Text style={[styles.dial, { color: theme.textPrimary }]}>+91</Text>
      <TextInput
        style={styles.phoneInput}
        keyboardType="phone-pad"
        placeholder="Mobile number"
        value={value}
        onChangeText={handleChange}
        maxLength={10}
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={Keyboard.dismiss}
        inputAccessoryViewID={
          Platform.OS === 'ios' ? PHONE_KEYBOARD_ACCESSORY_ID : undefined
        }
        {...rest}
      />
    </View>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const theme = useThemeColors();
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonCompact: {
    paddingVertical: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
  buttonTextCompact: {
    fontSize: typography.body,
  },
  secondaryButton: {
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonCompact: {
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerCompact: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: typography.title, fontWeight: '800' },
  headerTitleCompact: { fontSize: 18 },
  headerSubtitle: { opacity: 0.88, marginTop: 4, fontSize: typography.body },
  headerSubtitleCompact: { fontSize: typography.caption, marginTop: 2 },
  surfaceCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  dial: { fontSize: typography.subtitle, marginRight: spacing.md },
  phoneInput: { flex: 1, fontSize: typography.subtitle, paddingVertical: spacing.sm },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#eef2f4',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#c5cdd3',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fieldLabel: { marginBottom: 4, fontSize: typography.body },
});

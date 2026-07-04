import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import {
  PhoneInput,
  PhoneKeyboardAccessory,
  PHONE_KEYBOARD_ACCESSORY_ID,
  PrimaryButton,
  ScreenHeader,
} from '../../theme/components';
import { useAuth } from '../../store/AuthContext';
import { apiErrorMessage } from '../../utils/apiError';

export default function LoginScreen() {
  const { requestOtp, verifyOtp } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  async function onNext() {
    Keyboard.dismiss();
    if (phone.length < 10) return Alert.alert('Enter a valid 10-digit number');
    setLoading(true);
    try {
      await requestOtp(`+91${phone}`);
      setStep('otp');
    } catch (err) {
      Alert.alert('Could not send OTP', apiErrorMessage(err, 'Could not send OTP'));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await verifyOtp(`+91${phone}`, otp);
    } catch {
      Alert.alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PhoneKeyboardAccessory />
      <ScreenHeader title="Verify number" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.body}>
            <Text style={styles.prompt}>
              {step === 'phone'
                ? 'Please Enter Your Mobile Number'
                : `Enter the OTP sent to +91 ${phone}`}
            </Text>

            {step === 'phone' ? (
              <PhoneInput value={phone} onChangeText={setPhone} autoFocus />
            ) : (
              <>
                <Text style={styles.devHint}>Dev OTP: enter 123456</Text>
                <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                placeholder="6-digit OTP"
                value={otp}
                onChangeText={(text) => {
                  const digits = text.replace(/\D/g, '').slice(0, 6);
                  setOtp(digits);
                  if (digits.length === 6) Keyboard.dismiss();
                }}
                maxLength={6}
                autoFocus
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                inputAccessoryViewID={
                  Platform.OS === 'ios' ? PHONE_KEYBOARD_ACCESSORY_ID : undefined
                }
              />
              </>
            )}
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.footer}>
          {step === 'phone' ? (
            <PrimaryButton title="Next" onPress={onNext} loading={loading} />
          ) : (
            <PrimaryButton title="Verify" onPress={onVerify} loading={loading} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl },
  prompt: {
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: typography.body,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  otpInput: {
    borderBottomWidth: 2,
    borderColor: colors.borderFocused,
    fontSize: typography.title,
    letterSpacing: 8,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  footer: { padding: spacing.lg },
  devHint: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
});

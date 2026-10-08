import { Platform } from 'react-native';
import type { TextInputProps } from 'react-native';
import NativePhoneNumberHint from './NativePhoneNumberHint';

let pending: Promise<string | null> | null = null;

/** iOS uses its own autofill suggestions; it has no Android-style number chooser. */
export const phoneNumberInputProps: Pick<
  TextInputProps,
  'autoComplete' | 'textContentType' | 'keyboardType' | 'importantForAutofill'
> = {
  autoComplete: 'tel',
  textContentType: 'telephoneNumber',
  keyboardType: Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'phone-pad',
  importantForAutofill: 'yes',
};

/** True only on Android when Google Play services can show the Phone Number Hint sheet. */
export async function isPhoneNumberHintAvailable(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const native = NativePhoneNumberHint;
  if (!native?.isAvailable) return false;
  try {
    return await native.isAvailable();
  } catch {
    return false;
  }
}

/** A hint is not verification. Call your existing OTP flow after user confirmation. */
export function requestPhoneNumber(): Promise<string | null> {
  if (Platform.OS !== 'android') return Promise.resolve(null);
  const native = NativePhoneNumberHint;
  if (!native?.requestPhoneNumber) return Promise.resolve(null);
  if (pending) return pending;
  pending = Promise.resolve()
    .then(() => native.requestPhoneNumber())
    .then((value) => (typeof value === 'string' && value.trim() ? value : null))
    .catch(() => null)
    .finally(() => {
      pending = null;
    });
  return pending;
}

jest.mock('../NativePhoneNumberHint', () => ({
  __esModule: true,
  default: {
    requestPhoneNumber: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

import { Platform } from 'react-native';
import NativePhoneNumberHint from '../NativePhoneNumberHint';
import { isPhoneNumberHintAvailable, requestPhoneNumber } from '../index';

const native = NativePhoneNumberHint as unknown as {
  requestPhoneNumber: jest.Mock;
  isAvailable: jest.Mock;
};

beforeEach(() => {
  Object.assign(Platform, { OS: 'android' });
  native.requestPhoneNumber.mockReset();
  native.isAvailable.mockReset();
});

it('coalesces simultaneous requests and allows a later retry', async () => {
  native.requestPhoneNumber.mockResolvedValue('+919876543210');
  const first = requestPhoneNumber();
  expect(requestPhoneNumber()).toBe(first);
  expect(await first).toBe('+919876543210');
  expect(native.requestPhoneNumber).toHaveBeenCalledTimes(1);
  await requestPhoneNumber();
  expect(native.requestPhoneNumber).toHaveBeenCalledTimes(2);
});

it('falls back safely on cancellation or native errors', async () => {
  native.requestPhoneNumber
    .mockResolvedValueOnce(null)
    .mockRejectedValueOnce(new Error('Unavailable'));
  expect(await requestPhoneNumber()).toBeNull();
  expect(await requestPhoneNumber()).toBeNull();
});

it('does not invoke an Android chooser on iOS', async () => {
  Object.assign(Platform, { OS: 'ios' });
  expect(await requestPhoneNumber()).toBeNull();
  expect(native.requestPhoneNumber).not.toHaveBeenCalled();
});

it('uses the iOS name-and-phone keypad for international number entry', () => {
  const getPropsForPlatform = (os: 'ios' | 'android') => {
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: os },
    }));
    const props =
      jest.requireActual<typeof import('../index')>(
        '../index'
      ).phoneNumberInputProps;
    jest.dontMock('react-native');
    jest.resetModules();
    return props;
  };

  const iosProps = getPropsForPlatform('ios');
  const androidProps = getPropsForPlatform('android');
  expect(iosProps.keyboardType).toBe('name-phone-pad');
  expect(iosProps.autoComplete).toBe('tel');
  expect(iosProps.textContentType).toBe('telephoneNumber');
  expect(androidProps.keyboardType).toBe('phone-pad');
});

it('reports availability on Android and not on iOS', async () => {
  native.isAvailable.mockResolvedValue(true);
  expect(await isPhoneNumberHintAvailable()).toBe(true);
  Object.assign(Platform, { OS: 'ios' });
  expect(await isPhoneNumberHintAvailable()).toBe(false);
  expect(native.isAvailable).toHaveBeenCalledTimes(1);
});

it('returns false when the native module is missing', async () => {
  const original = native.isAvailable;
  // @ts-expect-error testing a missing native method
  native.isAvailable = undefined;
  try {
    expect(await isPhoneNumberHintAvailable()).toBe(false);
  } finally {
    native.isAvailable = original;
  }
});

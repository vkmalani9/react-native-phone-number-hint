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

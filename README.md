# react-native-phone-number-hint

[![CI](https://github.com/vkmalani9/react-native-phone-number-hint/actions/workflows/ci.yml/badge.svg)](https://github.com/vkmalani9/react-native-phone-number-hint/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/react-native-phone-number-hint.svg)](https://www.npmjs.com/package/react-native-phone-number-hint)
[![license](https://img.shields.io/npm/l/react-native-phone-number-hint.svg)](./LICENSE)

Lightweight, permission-free phone number picker for React Native. Android uses Google's current [Phone Number Hint](https://developer.android.com/identity/sign-in/credential-manager-siwg#phone-number-hint) API (Identity / `play-services-auth`). iOS gets autofill-friendly `TextInput` props. No contacts, phone, or SMS permissions. No third-party native wrappers.

A hint is **not** verification. After the user confirms the number, send OTP with your own auth flow.

## Why this exists

Older React Native helpers wrap the deprecated credentials `HintRequest` API. This package calls `GetPhoneNumberHintIntentRequest` from Google Identity, autolinks as a TurboModule, and fails closed (`null`) when Play services, a SIM, or the user is missing.

## Requirements

- React Native **0.76+** (New Architecture)
- Android minSdk **24**, with Google Play services
- iOS: no native dependency; `requestPhoneNumber()` returns `null`

## Installation

```sh
npm install react-native-phone-number-hint
# or
yarn add react-native-phone-number-hint
```

Rebuild the native app after install (`npx pod-install` is not required; there is no iOS native code).

### Expo

This is a native Android module. It does **not** run in Expo Go. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or `npx expo prebuild`.

## Usage

```tsx
import { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import {
  isPhoneNumberHintAvailable,
  phoneNumberInputProps,
  requestPhoneNumber,
} from 'react-native-phone-number-hint';

export function PhoneField() {
  const [phone, setPhone] = useState('');

  const onPick = async () => {
    const selected = await requestPhoneNumber();
    if (selected) setPhone(selected);
  };

  return (
    <>
      <TextInput
        {...phoneNumberInputProps}
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
      />
      <Pressable onPress={onPick}>
        <Text>Use phone number on this device</Text>
      </Pressable>
    </>
  );
}

// Optional: hide the picker button when the sheet cannot be shown.
void isPhoneNumberHintAvailable();
```

Call `requestPhoneNumber()` from a user gesture (button press). Normalize the returned string for your country before sending OTP.

## API

| Export | Returns | Notes |
| --- | --- | --- |
| `requestPhoneNumber()` | `Promise<string \| null>` | Android sheet. Concurrent JS callers share one chooser. Cancel, error, iOS, and missing Play services resolve `null`. |
| `isPhoneNumberHintAvailable()` | `Promise<boolean>` | `true` only on Android when Play services are present. |
| `phoneNumberInputProps` | `TextInput` props | `autoComplete`, `textContentType`, `keyboardType`, `importantForAutofill`. On iOS, `keyboardType` is `numbers-and-punctuation` so the keyboard can show a tappable phone suggestion when that number is on the Me contact. iOS does not open a chooser sheet. Android stays on `phone-pad`. |

This package never sends OTPs, authenticates, persists, or logs numbers.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Always `null` on Android | Physical device or emulator with Google Play, a signed-in Google account, and a phone number on the SIM / account |
| Sheet never appears | Call from a tap handler while an Activity is in the foreground; wait for the previous request to finish |
| Expo Go | Use a dev client / prebuild |
| Play services version | Override with `rootProject.ext.playServicesAuthVersion` (default `22.0.0`) |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please follow the [code of conduct](./CODE_OF_CONDUCT.md).

## License

MIT © Vikram Jangid Malani

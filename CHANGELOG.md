# Changelog

## Unreleased

- Use the iOS name-and-phone keypad for international phone entry.
- Clarify that availability only checks for an active Android Activity and Google Play services.

## 0.1.0

- Initial release.
- Android TurboModule for Google's Phone Number Hint API (`GetPhoneNumberHintIntentRequest`).
- Concurrent JS requests share one chooser; cancel and errors resolve `null`.
- `phoneNumberInputProps` for iOS / Android autofill-friendly inputs.
- `isPhoneNumberHintAvailable()` helper.

import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  requestPhoneNumber(): Promise<string | null>;
  isAvailable(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('PhoneNumberHint');

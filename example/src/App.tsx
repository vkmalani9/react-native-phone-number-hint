import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  isPhoneNumberHintAvailable,
  phoneNumberInputProps,
  requestPhoneNumber,
} from 'react-native-phone-number-hint';

export default function App() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    isPhoneNumberHintAvailable().then(setAvailable);
  }, []);

  const onPick = useCallback(async () => {
    setStatus('Opening picker…');
    const selected = await requestPhoneNumber();
    if (selected) {
      setPhone(selected);
      setStatus('Number selected');
      return;
    }
    setStatus('Cancelled or unavailable');
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Phone Number Hint</Text>
        <Text style={styles.meta}>
          Available:{' '}
          {available == null ? 'checking…' : available ? 'yes' : 'no'}
        </Text>
        <TextInput
          {...phoneNumberInputProps}
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
        />
        <Pressable style={styles.button} onPress={onPick}>
          <Text style={styles.buttonLabel}>Pick phone number</Text>
        </Pressable>
        <Text style={styles.status}>{status}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
  },
  meta: {
    color: '#94a3b8',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: '#cbd5e1',
    fontSize: 14,
  },
});

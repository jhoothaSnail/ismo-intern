import { ProjectStatus } from '@pms/contracts';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

function HomeScreen() {
  const [status, setStatus] = useState<string>('loading');

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((body: any) => {
        setStatus(body.data.status === 'ok' ? 'ok' : 'error');
      })
      .catch(() => setStatus('error'));
  }, []);

  const statusColor =
    status === 'ok' ? '#4ade80' : status === 'error' ? '#f87171' : '#facc15';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PMS — Walking Skeleton</Text>
      <Text style={styles.label}>
        API health:{' '}
        <Text style={{ fontWeight: '600', color: statusColor }}>{status}</Text>
      </Text>
      <Text style={styles.label}>
        ProjectStatus.NOT_STARTED:{' '}
        <Text style={styles.code}>{ProjectStatus.NOT_STARTED}</Text>
      </Text>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#030712',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    color: '#9ca3af',
    fontSize: 15,
  },
  status: {
    fontWeight: '600',
  },
  code: {
    color: '#c084fc',
  },
});

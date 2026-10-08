import { ProjectStatus } from '@pms/contracts';
import { useEffect, useState } from 'react';

type HealthStatus = 'loading' | 'ok' | 'error';

export default function App() {
  const [status, setStatus] = useState<HealthStatus>('loading');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((body: { data: { status: string } }) => {
        setStatus(body.data.status === 'ok' ? 'ok' : 'error');
      })
      .catch(() => setStatus('error'));
  }, []);

  const statusColor =
    status === 'ok'
      ? 'text-green-400'
      : status === 'error'
        ? 'text-red-400'
        : 'text-yellow-400';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-950 p-8 text-white">
      <h1 className="text-3xl font-bold">PMS — Walking Skeleton</h1>
      <p>
        API health:{' '}
        <span className={`font-semibold ${statusColor}`}>{status}</span>
      </p>
      <p className="text-sm text-gray-400">
        Contract check — ProjectStatus.NOT_STARTED:{' '}
        <code className="rounded bg-gray-800 px-2 py-0.5 text-purple-400">
          {ProjectStatus.NOT_STARTED}
        </code>
      </p>
    </main>
  );
}

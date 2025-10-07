import React, { useEffect, useRef, useState } from 'react';
import { getClient, subscribe as wsSubscribe, unsubscribe as wsUnsubscribe, on as wsOn, off as wsOff, connect as wsConnect } from '../services/wsClient';

/**
 * PUBLIC_INTERFACE
 * RealtimeFeed
 * Subscribes to wsClient for real-time events and renders a list with newest first.
 * Handles connect/disconnect, errors, and empty state.
 */
export default function RealtimeFeed() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('connecting'); // connecting | open | closed | error
  const unsubRef = useRef(null);

  useEffect(() => {
    try {
      setStatus('connecting');
      // Ensure a connection attempt is made (no-op under mocks)
      wsConnect();
      // Listen to global socket events to reflect connection status
      const offOpen = wsOn('open', () => setStatus('open'));
      const offClose = wsOn('close', () => setStatus('closed'));
      const offError = wsOn('error', () => setStatus('error'));

      // Subscribe to events channel
      const unsub = wsSubscribe('events', (payloadOrEnvelope) => {
        // If wsClient delivers envelope: { channel, data }, unwrap data; else pass through
        const payload = payloadOrEnvelope?.data ?? payloadOrEnvelope;
        setEvents((prev) => {
          const next = [{ id: genId(), ts: Date.now(), payload }, ...prev];
          return next.slice(0, 100);
        });
      });

      unsubRef.current = () => {
        try { unsub && unsub(); } catch {}
        try { offOpen && offOpen(); } catch {}
        try { offClose && offClose(); } catch {}
        try { offError && offError(); } catch {}
      };
    } catch (e) {
      setStatus('error');
    }

    return () => {
      if (typeof unsubRef.current === 'function') {
        try { unsubRef.current(); } catch {}
      } else {
        // Fallback: attempt explicit unsubscription by channel if API available
        try { wsUnsubscribe('events'); } catch {}
        try { wsOff('open'); } catch {}
        try { wsOff('close'); } catch {}
        try { wsOff('error'); } catch {}
      }
    };
  }, []);

  return (
    <div className="rounded-2xl bg-gray-800 border border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Realtime Feed</h3>
          <p className="text-gray-400 text-sm">Live anomalies, errors, deployments, and cost spikes</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-2 max-h-80 overflow-auto pr-1">
        {events.length === 0 ? (
          <div className="text-gray-400 text-sm">
            {status === 'connecting' && 'Connecting to live stream...'}
            {status === 'open' && 'Listening for events...'}
            {status === 'closed' && 'Connection closed.'}
            {status === 'error' && 'Stream error. Retrying or check connection.'}
          </div>
        ) : (
          events.map((e) => (
            <FeedItem key={e.id} item={e} />
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    connecting: { dot: 'bg-sky-400', text: 'text-sky-200', label: 'Connecting' },
    open: { dot: 'bg-emerald-400', text: 'text-emerald-200', label: 'Live' },
    closed: { dot: 'bg-gray-400', text: 'text-gray-300', label: 'Closed' },
    error: { dot: 'bg-red-500', text: 'text-red-300', label: 'Error' },
  };
  const s = map[status] || map.connecting;
  return (
    <div className={`rounded-full border ${s.text} border-gray-600 px-3 py-1 text-sm flex items-center gap-2`}>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
      <span className="font-medium">{s.label}</span>
    </div>
  );
}

function FeedItem({ item }) {
  const { ts, payload } = item;
  const time = new Date(ts).toLocaleTimeString();
  const { type, message, level, source } = normalizePayload(payload);

  const tone = levelToTone(level);

  return (
    <div
      className="rounded-xl bg-gray-900 border border-gray-700 p-3 focus-within:ring-2 ring-orange-500/40"
      tabIndex={0}
      aria-label={`${type || 'event'} ${message || ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${tone.dot}`} />
          <span className={`text-sm ${tone.text}`}>{type || 'event'}</span>
          {source && <span className="text-xs text-gray-400">• {source}</span>}
        </div>
        <div className="text-xs text-gray-400">{time}</div>
      </div>
      {message && <div className="mt-1 text-sm">{message}</div>}
    </div>
  );
}

function normalizePayload(p) {
  if (!p || typeof p !== 'object') {
    return { type: 'event', message: typeof p === 'string' ? p : '', level: 'info', source: undefined };
  }
  return {
    type: p.type || p.event || 'event',
    message: p.message || p.msg || '',
    level: p.level || 'info',
    source: p.source || p.service || p.function || undefined,
  };
}

function levelToTone(level) {
  switch ((level || '').toLowerCase()) {
    case 'error':
    case 'critical':
      return { dot: 'bg-red-500', text: 'text-red-300' };
    case 'warn':
    case 'warning':
      return { dot: 'bg-orange-400', text: 'text-orange-300' };
    case 'success':
      return { dot: 'bg-emerald-400', text: 'text-emerald-300' };
    default:
      return { dot: 'bg-sky-400', text: 'text-sky-300' };
  }
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

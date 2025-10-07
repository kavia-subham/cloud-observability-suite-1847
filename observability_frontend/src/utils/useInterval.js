import { useEffect, useRef } from 'react';

/**
 * useInterval - declarative setInterval that updates with latest callback.
 *
 * Example:
 * const { start, stop, running } = useInterval(() => doWork(), 2000, true);
 */

// PUBLIC_INTERFACE
export default function useInterval(callback, delay, autoStart = false) {
  const savedCallback = useRef(callback);
  const intervalId = useRef(null);
  const runningRef = useRef(false);

  // Keep latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = () => {
    if (runningRef.current || delay == null) return;
    runningRef.current = true;
    intervalId.current = setInterval(() => {
      if (savedCallback.current) savedCallback.current();
    }, delay);
  };

  const stop = () => {
    runningRef.current = false;
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  // Autostart
  useEffect(() => {
    if (autoStart) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, autoStart]);

  return { start, stop, get running() { return runningRef.current; } };
}

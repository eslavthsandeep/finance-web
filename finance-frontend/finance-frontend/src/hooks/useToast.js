// src/hooks/useToast.js
import { useState, useCallback } from 'react';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg) => push(msg, 'success'),
    error:   (msg) => push(msg, 'error'),
    info:    (msg) => push(msg, 'info'),
  };

  return { toasts, toast };
}

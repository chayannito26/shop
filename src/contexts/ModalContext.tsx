import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';

type AlertOptions = {
  title?: string;
  primaryLabel?: string;
};

type AlertRequest = {
  id: number;
  message: string;
  options?: AlertOptions;
  resolve: () => void;
};

const ModalContext = createContext<{
  showAlert: (message: string, options?: AlertOptions) => Promise<void>;
} | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<AlertRequest | null>(null);
  const queue = useRef<AlertRequest[]>([]);
  const idSeq = useRef(1);

  const processQueue = useCallback(() => {
    if (current) return;
    const next = queue.current.shift();
    if (next) {
      setCurrent(next);
    }
  }, [current]);

  useEffect(() => {
    processQueue();
  }, [processQueue]);

  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    return new Promise<void>((resolve) => {
      const req: AlertRequest = {
        id: idSeq.current++,
        message,
        options,
        resolve
      };
      queue.current.push(req);
      // trigger processing if idle
      setCurrent((c) => (c ? c : null));
      processQueue();
    });
  }, [processQueue]);

  const handleClose = useCallback(() => {
    if (!current) return;
    try {
      current.resolve();
    } catch {
      // ignore
    }
    setCurrent(null);
    // process next in microtask to avoid state collision
    setTimeout(() => processQueue(), 0);
  }, [current, processQueue]);

  return (
    <ModalContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        open={!!current}
        title={current?.options?.title}
        message={current?.message}
        primaryLabel={current?.options?.primaryLabel}
        onClose={handleClose}
      />
    </ModalContext.Provider>
  );
};

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

export default ModalContext;

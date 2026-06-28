'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface OverlayCtx {
  showLoginLoader: () => void;
}

const Ctx = createContext<OverlayCtx>({ showLoginLoader: () => {} });
export const useLoginLoader = () => useContext(Ctx);

export default function LoadingOverlayProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const showLoginLoader = useCallback(() => {
    // Clear any previous timers
    timers.current.forEach(clearTimeout);
    setVisible(true);
    setFading(false);

    // Start fade at 1400ms
    timers.current[0] = setTimeout(() => setFading(true), 1400);
    // Unmount at 1900ms
    timers.current[1] = setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, 1900);
  }, []);

  return (
    <Ctx.Provider value={{ showLoginLoader }}>
      {children}
      {visible && (
        <>
          <style>{`
            @keyframes plsPop {
              from { opacity: 0; transform: scale(0.92) translateY(10px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes plsSlide {
              0%   { transform: translateX(-100%); }
              50%  { transform: translateX(200%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'var(--admin-bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: fading ? 'none' : 'all',
          }}>
            <div style={{
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              borderRadius: 20,
              padding: '2rem 2.5rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              boxShadow: 'var(--admin-shadow)',
              animation: 'plsPop 0.3s ease',
              minWidth: 220,
            }}>
              <img
                src="/logo.png" alt="MakiSync"
                style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 14 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text-primary)', letterSpacing: '-0.02em' }}>
                MakiSync
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                Loading your portal…
              </div>
              <div style={{ width: 180, height: 4, borderRadius: 99, background: 'var(--admin-border)', overflow: 'hidden', marginTop: '0.25rem' }}>
                <div style={{
                  width: '45%', height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                  animation: 'plsSlide 1.2s infinite ease-in-out',
                }} />
              </div>
            </div>
          </div>
        </>
      )}
    </Ctx.Provider>
  );
}

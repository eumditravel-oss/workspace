"use client";

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>시스템 치명적 오류</h1>
          <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
            애플리케이션 최상단에서 심각한 오류가 발생했습니다. 브라우저를 새로고침하거나 관리자에게 문의해주세요.
          </p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}

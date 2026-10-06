import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f8fb' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12 }}>Página não encontrada</h1>
        <Link href="/dashboard" style={{ color: '#0d6efd', textDecoration: 'none' }}>Voltar ao painel</Link>
      </div>
    </main>
  );
}

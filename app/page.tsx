import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Página principal</h1>
      <p>Bienvenido a la demostración de PagoPlux/Paybox.</p>
      <p>
        <Link href="/credits">Ir a comprar créditos</Link>
      </p>
    </main>
  );
}

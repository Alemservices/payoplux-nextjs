import PayboxWidget from '@/components/billing/PayboxWidget';

/**
 * Credits page where users can purchase credit packages using the PagoPlux
 * integration. The widget encapsulates all of the payment logic. This page
 * only composes the UI and should remain simple.
 */
export default function CreditsPage() {
  return (
    <main>
      <h1>Compra de créditos</h1>
      <p>Selecciona un paquete y paga con Paybox.</p>
      <PayboxWidget />
    </main>
  );
}

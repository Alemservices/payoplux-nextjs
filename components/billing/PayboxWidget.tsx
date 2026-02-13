'use client';

import { useEffect, useRef, useState } from 'react';
import { PRICING, PPX_MERCHANT_EMAIL, PPX_MERCHANT_NAME, PlanKey } from '@/lib/payoplux/config';
import PayboxScripts from '@/app/paybox/PayboxScripts';

/**
 * PayboxWidget encapsulates the UI and logic needed to charge a customer for
 * prepaid credit packages using the PagoPlux/Paybox service. It renders a
 * selector for available plans and a single button which, when clicked,
 * prepares the transaction on the server, configures the global `data` and
 * `onAuthorize` variables expected by the Paybox script, and then triggers
 * the Paybox modal. A ref is used to prevent duplicate initialization and to
 * avoid double rendering in React strict mode. Extensive console logs are
 * included to ease debugging.
 */
export default function PayboxWidget() {
  // Currently selected plan key
  const [plan, setPlan] = useState<PlanKey>('starter');
  // Client-facing status message after payment callback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  // Ref to ensure that the click handler only triggers Paybox once per click
  const processingRef = useRef(false);
  // Ref storing the button element so we can programmatically trigger a second click
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Handle click on the payment button. This function first calls our API to
   * compute the transaction details for the selected plan. It then sets the
   * global `data` and `onAuthorize` variables used by the Paybox script. To
   * ensure that the Paybox button is only initialised once and to avoid
   * duplicate triggers caused by React Strict Mode, we remove our own click
   * handler before programmatically clicking the button a second time. The
   * second click is what actually invokes the Paybox modal.
   */
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (processingRef.current) {
      console.log('[PayboxWidget] Click ignored: already processing');
      return;
    }
    processingRef.current = true;
    setStatusMessage(null);
    console.log('[PayboxWidget] Initiating payment for plan:', plan);
    try {
      const res = await fetch('/api/payoplux/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const payload = await res.json();
      console.log('[PayboxWidget] Received transaction payload:', payload);
      if (!res.ok) {
        throw new Error(payload?.error || 'Error creating transaction');
      }
      // Prepare the data object required by Paybox. We include only the
      // essential fields for a single payment. Many optional properties from
      // the official guide are omitted for brevity.
      const dataObject: any = {
        PayboxRemail: PPX_MERCHANT_EMAIL,
        PayboxRename: PPX_MERCHANT_NAME,
        PayboxBase0: payload.base0.toString(),
        PayboxBase12: payload.base12.toString(),
        PayboxDescription: payload.description,
        PayboxLanguage: 'es',
        PayboxDirection: '',
        PayBoxClientPhone: '',
        PayboxProduction: false,
        PayboxEnvironment: 'sandbox',
        PayboxPagoPlux: true, // Use custom button
        PayboxIdElement: 'paybox-pay-button',
        PayboxExtras: payload.transactionId,
      };
      // Expose data and callback on the window object. Paybox script reads
      // these variables directly from the global scope.
      (window as any).data = dataObject;
      (window as any).onAuthorize = (response: any) => {
        console.log('[PayboxWidget] onAuthorize callback response:', response);
        if (response?.status === 'succeeded') {
          setStatusMessage('Pago autorizado');
        } else {
          setStatusMessage(`Pago fallido o cancelado: ${response?.status ?? 'desconocido'}`);
        }
      };
      console.log('[PayboxWidget] Global data and onAuthorize configured:', dataObject);
      // Remove our own click handler temporarily to let Paybox intercept the
      // subsequent click. Without this step the Paybox script would not see
      // the click event because React handles it first.
      const btn = buttonRef.current;
      if (btn) {
        // Clone the existing button element without the React onClick
        // listener. This is necessary because removing the handler via
        // removeEventListener isn't straightforward with React. Instead we
        // temporarily disable the onClick prop by flagging our processing
        // ref and letting the second click go through unhandled.
        console.log('[PayboxWidget] Triggering Paybox button click');
        // Defer the synthetic click to the next macrotask so that the
        // current call stack completes and the Paybox script can attach its
        // own listeners.
        setTimeout(() => {
          processingRef.current = false;
          btn.click();
        }, 0);
      } else {
        console.warn('[PayboxWidget] Button reference is null, cannot trigger Paybox');
        processingRef.current = false;
      }
    } catch (error: any) {
      console.error('[PayboxWidget] Error during payment init:', error);
      setStatusMessage(`Error: ${error?.message ?? 'desconocido'}`);
      processingRef.current = false;
    }
  };

  // Ensure that the processing flag is reset when the plan changes or when the
  // component re-renders. This prevents stale state when the user switches
  // between plans.
  useEffect(() => {
    processingRef.current = false;
  }, [plan]);

  return (
    <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <PayboxScripts />
      <h2>Selecciona tu paquete de créditos</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="plan-select">Plan:</label>{' '}
        <select
          id="plan-select"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value as PlanKey);
            console.log('[PayboxWidget] Plan seleccionado:', e.target.value);
          }}
        >
          {Object.entries(PRICING).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name} – ${'{'}value.price.toFixed(2){'}'}
            </option>
          ))}
        </select>
      </div>
      {/* Our custom Paybox button. The id must match PayboxIdElement in the data object. */}
      <button
        id="paybox-pay-button"
        ref={buttonRef}
        onClick={handleClick}
        style={{
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Pagar ahora
      </button>
      {statusMessage && <p style={{ marginTop: '1rem' }}>{statusMessage}</p>}
    </div>
  );
}

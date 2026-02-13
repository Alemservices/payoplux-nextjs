'use client';

import Script from 'next/script';

/**
 * A helper component that loads the external dependencies required by the
 * PagoPlux/Paybox integration. The Paybox guide stipulates that jQuery
 * version 3.4.1 and the Paybox script must be present on the page. These
 * scripts are loaded lazily after the page has become interactive. Load
 * events are logged to aid debugging. Do not remove these logs as they are
 * useful when verifying that the scripts have been loaded only once.
 */
export default function PayboxScripts() {
  return (
    <>
      <Script
        id="paybox-jquery"
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[PayboxScripts] jQuery loaded');
        }}
      />
      <Script
        id="paybox-index"
        src="https://sandbox-paybox.pagoplux.com/paybox/index.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[PayboxScripts] Paybox script loaded');
        }}
      />
    </>
  );
}

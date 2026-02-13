# PagoPlux (Paybox) Next.js Integration

Este proyecto contiene una integración completamente funcional del botón de pagos de **PagoPlux/Paybox** en un proyecto **Next.js** con App Router. La integración está configurada para el entorno **sandbox** utilizando las credenciales proporcionadas por el usuario y cumple con los siguientes requisitos:

- **Sin `.env`:** todas las credenciales se declaran explícitamente en los archivos de código. El `PPX_SECRET_KEY` sólo se encuentra en módulos del servidor y **nunca** se expone al cliente.
- **App Router:** la estructura sigue el patrón de `/app` introducido por Next.js 13/14.
- **Flujo de pago completo:** la página `/credits` permite seleccionar un paquete (Starter, Pro o Premium) y abrir el flujo de pago en un modal de PagoPlux. Al finalizar se ejecuta el callback `onAuthorize` que actualiza la UI y registra la respuesta en consola.
- **Logs útiles:** tanto en cliente como en servidor se imprimen mensajes que permiten rastrear la carga de scripts, la creación de transacciones y la respuesta de pago.
- **Prevención de duplicados:** se utiliza una referencia (`useRef`) para evitar que el botón se inicialice o se procese dos veces debido al doble renderizado en `reactStrictMode`.

## Estructura de archivos

```
payoplux-nextjs/
├── app/
│   ├── api/
│   │   └── payoplux/
│   │       └── create/route.ts    // Route Handler que prepara la transacción en el servidor
│   ├── credits/page.tsx          // Página pública con el widget de pago
│   ├── layout.tsx                // Layout raíz de la aplicación
│   ├── page.tsx                  // Página de inicio con enlace a /credits
│   ├── globals.css               // Estilos globales simples
│   └── paybox/PayboxScripts.tsx  // Carga jQuery y el script de Paybox en el cliente
├── components/
│   └── billing/PayboxWidget.tsx  // Componente principal del botón y lógica de pago
├── lib/
│   └── payoplux/
│       ├── config.ts             // Configuración pública (sin el secret)
│       └── server.ts             // Funciones de servidor y secret key
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md (este archivo)
```

## Instrucciones de ejecución

> **Nota:** debido a que este proyecto no incluye las dependencias instaladas en este entorno, al clonar el repositorio debes ejecutar primero `npm install` para descargar `next`, `react` y las demás dependencias. Luego inicia el servidor de desarrollo con `npm run dev`.

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

3. **Abrir el navegador:** navega a `http://localhost:3000/credits` para ver la página de compra de créditos.

4. **Seleccionar un paquete:** elige entre *Starter*, *Pro* o *Premium* en el selector. Se mostrará el precio junto al nombre.

5. **Pagar:** haz clic en **Pagar ahora**. En la consola del navegador se registrarán las siguientes etapas:
   - Carga de jQuery y del script de Paybox.
   - Plan seleccionado y solicitud al endpoint `/api/payoplux/create`.
   - Datos recibidos del servidor y configuración de la variable global `data`.
   - Llamada al botón de Paybox para abrir el modal.

6. **Completar el pago:** se abrirá la interfaz de PagoPlux (sandbox). Utiliza las tarjetas de prueba proporcionadas por PagoPlux (ver documento PDF) para completar el pago. Una vez finalizado, observa la consola para ver el objeto de respuesta completo. Si `response.status` es `succeeded`, la UI mostrará `Pago autorizado`; de lo contrario se mostrará un mensaje de fallo o cancelación.

## Checklist de pruebas

Antes de finalizar la integración, verifica lo siguiente:

- [ ] Al arrancar el proyecto, en la consola del navegador aparece `jQuery loaded` y `Paybox script loaded` una sola vez.
- [ ] Cambiar el plan en el selector actualiza internamente la variable `plan` (revisa logs `Plan seleccionado`).
- [ ] Al hacer clic por primera vez en **Pagar ahora** se registra en la consola `[PayboxWidget] Initiating payment for plan: ...` y se obtiene respuesta del endpoint.
- [ ] El modal de Paybox se abre correctamente y permite introducir datos de tarjeta en modo sandbox.
- [ ] Después de completar la transacción, se ejecuta el callback `onAuthorize` y se imprime el objeto `response` en consola.
- [ ] La UI muestra `Pago autorizado` si la transacción fue exitosa o `Pago fallido/cancelado` si no lo fue.
- [ ] Al recargar la página o ejecutar en modo `reactStrictMode`, el botón **Pagar ahora** se renderiza una sola vez y el flujo no se duplica.

## Consideraciones

- **Seguridad del secret:** el archivo `lib/payoplux/server.ts` contiene el `PPX_SECRET_KEY` necesario para firmar o preparar órdenes. Este archivo está marcado como server-only y nunca se importa en componentes cliente. Si mueves funciones a otras partes del código, asegúrate de que este secret no termine en el bundle del navegador.
- **API de PagoPlux:** este ejemplo no realiza una llamada real al API de PagoPlux debido a que la documentación oficial no está disponible públicamente. La función `createTransaction` genera un identificador de transacción y una firma ficticia usando HMAC. En un entorno real deberías contactar a PagoPlux para obtener los endpoints y algoritmos de firma correctos.
- **Modo sandbox:** toda la configuración (`PayboxProduction: false`, `PayboxEnvironment: 'sandbox'`) está orientada a pruebas. Para pasar a producción, cambia estos valores a `true`/`'prod'` y actualiza las credenciales.

¡Buena suerte con tu integración!

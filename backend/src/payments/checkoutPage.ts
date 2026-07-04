import { env } from '../config/env';

export function buildCheckoutUrl(subscriptionId: string, token: string): string {
  const base = env.publicApiUrl.replace(/\/$/, '');
  return `${base}/api/subscriptions/checkout/${subscriptionId}?token=${encodeURIComponent(token)}`;
}

export function buildCheckoutCompleteUrl(subscriptionId: string, token: string): string {
  const base = env.publicApiUrl.replace(/\/$/, '');
  return `${base}/api/subscriptions/checkout/complete/${subscriptionId}?token=${encodeURIComponent(token)}`;
}

export function renderCheckoutHtml(params: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  subscriptionId: string;
  checkoutToken: string;
}): string {
  const {
    keyId,
    orderId,
    amount,
    currency,
    name,
    description,
    subscriptionId,
    checkoutToken,
  } = params;
  const completeBase = buildCheckoutCompleteUrl(subscriptionId, checkoutToken).split('?')[0];
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UseMe Subscription</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f7f8; }
    .box { text-align: center; padding: 24px; }
    p { color: #6b7280; }
  </style>
</head>
<body>
  <div class="box"><p>Opening Razorpay checkout…</p></div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    var checkoutToken = ${JSON.stringify(checkoutToken)};
    var completeBase = ${JSON.stringify(completeBase)};
    var paid = false;

    function redirectSuccess(response) {
      paid = true;
      window.location.href = completeBase +
        '?token=' + encodeURIComponent(checkoutToken) +
        '&paymentId=' + encodeURIComponent(response.razorpay_payment_id) +
        '&signature=' + encodeURIComponent(response.razorpay_signature);
    }

    var options = {
      key: ${JSON.stringify(keyId)},
      order_id: ${JSON.stringify(orderId)},
      amount: ${amount},
      currency: ${JSON.stringify(currency)},
      name: ${JSON.stringify(name)},
      description: ${JSON.stringify(description)},
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [{ method: 'upi' }],
            },
            others: {
              name: 'Other payment methods',
              instruments: [
                { method: 'card' },
                { method: 'netbanking' },
                { method: 'wallet' },
                { method: 'paylater' },
              ],
            },
          },
          sequence: ['block.upi', 'block.others'],
          preferences: { show_default_blocks: true },
        },
      },
      handler: function (response) {
        redirectSuccess(response);
      },
      modal: {
        ondismiss: function () {
          setTimeout(function () {
            if (!paid && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'payment_cancel' }));
            }
          }, 500);
        }
      },
      theme: { color: '#1C5E78' }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  </script>
</body>
</html>`;
}

export function renderCheckoutCompleteHtml(result: {
  success: boolean;
  subscriptionValidUntil?: string;
  durationDays?: number;
  error?: string;
}): string {
  const payload = JSON.stringify({
    type: result.success ? 'subscription_verified' : 'subscription_verify_failed',
    subscriptionValidUntil: result.subscriptionValidUntil ?? null,
    durationDays: result.durationDays ?? null,
    error: result.error ?? null,
  });
  const title = result.success ? 'Payment successful' : 'Payment verification failed';
  const message = result.success
    ? 'Your subscription is now active. Return to the UseMe app.'
    : (result.error ?? 'Please try again.');
  const bg = result.success ? '#f0fdf4' : '#fef2f2';
  const headingColor = result.success ? '#059669' : '#dc2626';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: ${bg}; }
    .box { text-align: center; padding: 24px; max-width: 320px; }
    h1 { color: ${headingColor}; font-size: 1.25rem; }
    p { color: #6b7280; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="box">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
  <script>
    (function () {
      var payload = ${payload};
      function send() {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }
      send();
      setTimeout(send, 300);
    })();
  </script>
</body>
</html>`;
}

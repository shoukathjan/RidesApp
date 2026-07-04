import { useState } from 'react';
import { CreditCard, FlaskConical } from 'lucide-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { loadRazorpayCheckout } from '../lib/razorpay';

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

function friendlyPaymentError(description: string): string {
  if (/international cards are not supported/i.test(description)) {
    return (
      'International cards are not enabled on your Razorpay account. ' +
      'Use a domestic Indian test card: 4111 1111 1111 1111 (Visa) or 5267 3181 8797 5449 (Mastercard), ' +
      'any future expiry, any CVV. Or pay via UPI: success@razorpay'
    );
  }
  return description;
}

export default function PaymentCheckout() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      if (!KEY_ID) {
        throw new Error('VITE_RAZORPAY_KEY_ID is not set in admin-web/.env');
      }

      await loadRazorpayCheckout();

      const { data: order } = await api.post<{
        order_id: string;
        amount: number;
        currency: string;
      }>('/create-order', {
        amount: 10000,
        currency: 'INR',
        receipt: `admin_test_${Date.now()}`.slice(0, 40),
      });

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'UseMe',
          description: 'Standard Checkout test (₹100)',
          order_id: order.order_id,
          handler: async (response: RazorpaySuccess) => {
            try {
              const { data } = await api.post<{ success: boolean }>('/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (data.success) {
                setMessage(`Payment verified. ID: ${response.razorpay_payment_id}`);
              }
              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
          theme: { color: '#1C5E78' },
        });

        rzp.on('payment.failed', (payload: unknown) => {
          const p = payload as { error?: { description?: string } };
          const raw = p.error?.description ?? 'Payment failed';
          reject(new Error(friendlyPaymentError(raw)));
        });

        rzp.open();
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Payment could not be completed';
      if (msg !== 'Payment cancelled') {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Razorpay Standard Checkout"
        subtitle="Test payment integration with Razorpay test credentials"
      />

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-600">
            <FlaskConical className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Creates an order via <code>POST /api/create-order</code>, opens the Razorpay modal,
            then verifies via <code>POST /api/verify-payment</code>.
          </p>
        </div>

        <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5">
          <p className="font-semibold text-slate-900">Test mode — use domestic cards only</p>
          <p className="mt-2 text-sm text-slate-600">
            Your Razorpay account accepts <strong>Indian (domestic)</strong> cards only.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              <strong>Visa:</strong> 4111 1111 1111 1111
            </li>
            <li>
              <strong>Mastercard:</strong> 5267 3181 8797 5449
            </li>
            <li>Expiry: any future date · CVV: any 3 digits</li>
            <li>
              <strong>UPI:</strong> success@razorpay
            </li>
          </ul>
        </div>

        <Button variant="accent" className="mt-5" onClick={pay} disabled={busy}>
          <CreditCard className="h-4 w-4" />
          {busy ? 'Processing…' : 'Pay ₹100 (test)'}
        </Button>

        {message ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        ) : null}
      </Card>

      <Card className="bg-slate-50/50">
        <p className="text-sm text-slate-600">
          <strong className="text-slate-900">Driver subscriptions</strong> use the same Razorpay
          keys via <code>/api/subscriptions/order</code> and WebView checkout on the driver app.
        </p>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (payload: unknown) => void) => void;
    };
  }
}

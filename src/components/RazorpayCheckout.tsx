import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useAuth } from '../lib/auth'
import { setCheckoutOpener, type RazorpayResult } from '../lib/pay'
import type { PaymentOrder } from '../lib/types'
import { colors, sp } from '../lib/theme'

// Builds the tiny page that loads Razorpay's checkout.js and opens the popup for
// an already-created order. It posts the result back to RN via postMessage:
//   { type: 'success', ...ids } | { type: 'dismiss' } | { type: 'failed', message }
function checkoutHtml(order: PaymentOrder, prefill: { email: string; name: string }): string {
  const options = {
    key: order.keyId,
    amount: order.amount, // paise, already discounted
    currency: order.currency,
    order_id: order.razorpayOrderId,
    name: 'GoJulley',
    description: 'Ladakh trip booking',
    prefill,
    theme: { color: colors.navy },
  }
  return `<!doctype html>
<html>
  <head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /></head>
  <body style="margin:0;background:#28328c">
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
      function post(o) { window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
      var options = ${JSON.stringify(options)};
      options.handler = function (r) {
        post({ type: 'success', razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
      };
      options.modal = { ondismiss: function () { post({ type: 'dismiss' }); }, escape: true };
      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          post({ type: 'failed', message: (resp && resp.error && resp.error.description) || 'Payment failed.' });
        });
        rzp.open();
      } catch (e) {
        post({ type: 'failed', message: 'Could not start payment: ' + e });
      }
    </script>
  </body>
</html>`
}

export default function RazorpayCheckout() {
  const { user } = useAuth()
  const [order, setOrder] = useState<PaymentOrder | null>(null)
  const [loading, setLoading] = useState(true)
  // Held resolve/reject of the in-flight payOrder() promise.
  const pending = useRef<{ resolve: (r: RazorpayResult) => void; reject: (e: Error) => void } | null>(null)

  useEffect(() => {
    // Register the opener that lib/pay.ts calls for real orders.
    setCheckoutOpener(
      (o) =>
        new Promise<RazorpayResult>((resolve, reject) => {
          pending.current = { resolve, reject }
          setLoading(true)
          setOrder(o)
        }),
    )
    return () => setCheckoutOpener(null)
  }, [])

  function finish(result: RazorpayResult | null, err?: string) {
    const p = pending.current
    pending.current = null
    setOrder(null)
    if (result) p?.resolve(result)
    else p?.reject(new Error(err || 'Payment cancelled.'))
  }

  function onMessage(raw: string) {
    let msg: { type: string; message?: string } & Partial<RazorpayResult>
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }
    if (msg.type === 'success' && msg.razorpayOrderId && msg.razorpayPaymentId && msg.razorpaySignature) {
      finish({
        razorpayOrderId: msg.razorpayOrderId,
        razorpayPaymentId: msg.razorpayPaymentId,
        razorpaySignature: msg.razorpaySignature,
      })
    } else if (msg.type === 'failed') {
      finish(null, msg.message)
    } else if (msg.type === 'dismiss') {
      finish(null, 'Payment cancelled.')
    }
  }

  return (
    <Modal visible={!!order} animationType="slide" onRequestClose={() => finish(null)}>
      <View style={styles.wrap}>
        <View style={styles.bar}>
          <Text style={styles.barTitle}>Secure payment</Text>
          <Pressable onPress={() => finish(null)} hitSlop={10}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        {order && (
          <WebView
            originWhitelist={['*']}
            source={{ html: checkoutHtml(order, { email: user?.email ?? '', name: user?.name ?? '' }) }}
            onMessage={(e) => onMessage(e.nativeEvent.data)}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            // Keep redirect-based methods (netbanking/UPI intent) navigating inside
            // this WebView instead of trying to open a blocked popup window.
            javaScriptCanOpenWindowsAutomatically
            setSupportMultipleWindows={false}
            mixedContentMode="always"
            onShouldStartLoadWithRequest={() => true}
            style={{ flex: 1, backgroundColor: colors.navy }}
          />
        )}
        {loading && (
          <View style={styles.loading} pointerEvents="none">
            <ActivityIndicator color="#fff" size="large" />
            <Text style={styles.loadingText}>Loading payment…</Text>
          </View>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy },
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp(4), paddingTop: sp(14), paddingBottom: sp(3), backgroundColor: colors.navy,
  },
  barTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  close: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy },
  loadingText: { color: '#fff', marginTop: sp(3), fontWeight: '600' },
})

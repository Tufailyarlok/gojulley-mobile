import type { PaymentOrder } from './types'

type Verify = (r: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => Promise<void>

/**
 * Complete a payment order. The backend is currently in MOCK mode
 * (order.real === false), so we confirm directly with placeholder ids —
 * exactly like the web app does in mock mode.
 *
 * For live payments, add `react-native-razorpay` (a native module, needs an
 * EAS dev build) and open RazorpayCheckout here when order.real is true.
 */
export async function payOrder(order: PaymentOrder, verify: Verify): Promise<void> {
  if (!order.real) {
    await verify({ razorpayOrderId: order.razorpayOrderId, razorpayPaymentId: 'mock_pay', razorpaySignature: 'mock_sig' })
    return
  }
  throw new Error('Live card/UPI payments need the Razorpay native module. The backend is in mock mode for now.')
}

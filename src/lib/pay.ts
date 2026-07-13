import type { PaymentOrder } from './types'

export interface RazorpayResult {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

type Verify = (r: RazorpayResult) => Promise<void>

// A root-mounted <RazorpayCheckout/> host registers this opener. It presents the
// Razorpay checkout in a WebView (Expo Go can't use the native SDK) and resolves
// with the gateway result, or rejects if the user cancels / payment fails.
type Opener = (order: PaymentOrder) => Promise<RazorpayResult>
let opener: Opener | null = null
export function setCheckoutOpener(fn: Opener | null) {
  opener = fn
}

/**
 * Complete a payment order.
 * - Mock mode (order.real === false): confirm directly with placeholder ids,
 *   exactly like the web app does when the backend has no Razorpay keys.
 * - Real mode (order.real === true): open the Razorpay checkout WebView, then
 *   verify the returned signature with the backend before it flips to CONFIRMED.
 */
export async function payOrder(order: PaymentOrder, verify: Verify): Promise<void> {
  if (!order.real) {
    await verify({ razorpayOrderId: order.razorpayOrderId, razorpayPaymentId: 'mock_pay', razorpaySignature: 'mock_sig' })
    return
  }
  if (!opener) throw new Error('Payment screen isn’t ready yet — please try again.')
  const result = await opener(order)
  await verify(result)
}

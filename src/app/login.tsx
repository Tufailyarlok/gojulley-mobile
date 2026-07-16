import { useState, type ComponentProps } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  forgotPassword,
  login,
  requestLoginOtp,
  resendOtp,
  resetPassword,
  signup,
  verifyLoginOtp,
  verifyOtp,
} from '../lib/api'
import { useAuth } from '../lib/auth'
import { colors, radius, sp } from '../lib/theme'

// login/signup/verify are the original flows; loginotp completes a passwordless
// login OR a 2FA challenge (same emailed LOGIN code); forgot->reset resets a
// password via an emailed code.
type Mode = 'login' | 'signup' | 'verify' | 'loginotp' | 'forgot' | 'reset'

const TITLES: Record<Mode, string> = {
  login: 'Log in',
  signup: 'Create account',
  verify: 'Verify email',
  loginotp: 'Enter login code',
  forgot: 'Reset password',
  reset: 'Reset password',
}

export default function Login() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [twoFactor, setTwoFactor] = useState(false) // loginotp came from a 2FA challenge
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') // doubles as the new password in reset
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function go(next: Mode) {
    setMode(next)
    setError(null)
    setMsg(null)
    setCode('')
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const done = () => router.replace('/')

  const doLogin = () =>
    run(async () => {
      const res = await login(email.trim(), password)
      if (res.twoFactorRequired) {
        // Password was right; a login code was emailed. Go enter it.
        setTwoFactor(true)
        go('loginotp')
        setMsg('For extra security, enter the code we emailed you.')
        return
      }
      signIn({ token: res.token!, email: res.email, name: res.name!, role: res.role! })
      done()
    })
  const doSignup = () => run(async () => { const r = await signup(email.trim(), password, name.trim()); go('verify'); setMsg(r.message) })
  const doVerify = () => run(async () => { signIn(await verifyOtp(email.trim(), code.trim())); done() })
  const doResend = () => run(async () => { const r = await resendOtp(email.trim()); setMsg(r.message) })

  // Passwordless: email a login code, then enter it.
  const doLoginCode = () =>
    run(async () => {
      if (!email.trim()) { setError('Enter your email first.'); return }
      const r = await requestLoginOtp(email.trim())
      setTwoFactor(false)
      go('loginotp')
      setMsg(r.message)
    })
  const doVerifyLoginOtp = () => run(async () => { signIn(await verifyLoginOtp(email.trim(), code.trim())); done() })
  const doResendLoginOtp = () => run(async () => { const r = await requestLoginOtp(email.trim()); setMsg(r.message) })

  // Forgot -> reset.
  const doForgot = () => run(async () => { const r = await forgotPassword(email.trim()); go('reset'); setMsg(r.message) })
  const doReset = () => run(async () => { signIn(await resetPassword(email.trim(), code.trim(), password)); done() })

  const primaryAction: () => void =
    mode === 'login' ? doLogin
    : mode === 'signup' ? doSignup
    : mode === 'verify' ? doVerify
    : mode === 'loginotp' ? doVerifyLoginOtp
    : mode === 'forgot' ? doForgot
    : doReset

  const primaryLabel =
    busy ? 'Please wait…'
    : mode === 'login' ? 'Log in'
    : mode === 'signup' ? 'Sign up'
    : mode === 'verify' ? 'Verify & continue'
    : mode === 'loginotp' ? 'Log in'
    : mode === 'forgot' ? 'Send reset code'
    : 'Set new password'

  const showEmail = mode === 'login' || mode === 'signup' || mode === 'forgot'
  const showPassword = mode === 'login' || mode === 'signup'
  const showCode = mode === 'verify' || mode === 'loginotp' || mode === 'reset'

  return (
    <ScrollView contentContainerStyle={{ padding: sp(5) }}>
      <Text style={styles.h}>{TITLES[mode]}</Text>

      {msg && <View style={styles.notice}><Text style={{ color: '#065f46' }}>{msg}</Text></View>}
      {error && <View style={styles.err}><Text style={{ color: colors.danger }}>{error}</Text></View>}

      {mode === 'signup' && (
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      )}
      {showEmail && (
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
      )}
      {showPassword && (
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      )}
      {showCode && (
        <Field
          label={mode === 'loginotp'
            ? `Login code (emailed to ${email.trim()})`
            : mode === 'reset'
              ? 'Reset code (sent to your email)'
              : '6-digit code (sent to your email)'}
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
        />
      )}
      {mode === 'reset' && (
        <Field label="New password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      )}

      <Pressable style={[styles.primary, busy && { opacity: 0.6 }]} disabled={busy} onPress={primaryAction}>
        <Text style={styles.primaryText}>{primaryLabel}</Text>
      </Pressable>

      {mode === 'login' && (
        <>
          <Pressable onPress={doLoginCode} disabled={busy} style={styles.link}>
            <Text style={styles.linkText}>Email me a login code</Text>
          </Pressable>
          <Pressable onPress={() => go('forgot')} style={styles.link}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
          <Pressable onPress={() => go('signup')} style={styles.link}>
            <Text style={styles.linkText}>New here? Create an account</Text>
          </Pressable>
        </>
      )}
      {mode === 'signup' && (
        <Pressable onPress={() => go('login')} style={styles.link}>
          <Text style={styles.linkText}>Have an account? Log in</Text>
        </Pressable>
      )}
      {mode === 'verify' && (
        <Pressable onPress={doResend} style={styles.link}><Text style={styles.linkText}>Resend code</Text></Pressable>
      )}
      {mode === 'loginotp' && (
        <>
          <Pressable onPress={doResendLoginOtp} style={styles.link}><Text style={styles.linkText}>Resend code</Text></Pressable>
          {!twoFactor && (
            <Pressable onPress={() => go('login')} style={styles.link}>
              <Text style={styles.linkText}>Use a password instead</Text>
            </Pressable>
          )}
        </>
      )}
      {(mode === 'forgot' || mode === 'reset') && (
        <Pressable onPress={() => go('login')} style={styles.link}>
          <Text style={styles.linkText}>Back to log in</Text>
        </Pressable>
      )}
    </ScrollView>
  )
}

function Field(props: ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props
  return (
    <View style={{ marginBottom: sp(3) }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...rest} placeholderTextColor={colors.faint} autoCapitalize="none" style={styles.input} />
    </View>
  )
}

const styles = StyleSheet.create({
  h: { color: colors.ink, fontWeight: '900', fontSize: 24, marginBottom: sp(4) },
  label: { color: colors.faint, fontSize: 12, fontWeight: '700', marginBottom: sp(1) },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: sp(3), fontSize: 15, color: colors.ink },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3.5), alignItems: 'center', marginTop: sp(2) },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  link: { alignItems: 'center', marginTop: sp(4) },
  linkText: { color: colors.navy, fontWeight: '700' },
  notice: { backgroundColor: '#ecfdf5', borderRadius: radius.md, padding: sp(3), marginBottom: sp(3) },
  err: { backgroundColor: '#fef2f2', borderRadius: radius.md, padding: sp(3), marginBottom: sp(3) },
})

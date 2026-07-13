import { useState, type ComponentProps } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { login, resendOtp, signup, verifyOtp } from '../src/lib/api'
import { useAuth } from '../src/lib/auth'
import { colors, radius, sp } from '../src/lib/theme'

type Mode = 'login' | 'signup' | 'verify'

export default function Login() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

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
  const doLogin = () => run(async () => { signIn(await login(email.trim(), password)); router.replace('/') })
  const doSignup = () => run(async () => { const r = await signup(email.trim(), password, name.trim()); setMsg(r.message); setMode('verify') })
  const doVerify = () => run(async () => { signIn(await verifyOtp(email.trim(), code.trim())); router.replace('/') })
  const doResend = () => run(async () => { const r = await resendOtp(email.trim()); setMsg(r.message) })

  return (
    <ScrollView contentContainerStyle={{ padding: sp(5) }}>
      <Text style={styles.h}>{mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Verify email'}</Text>

      {msg && <View style={styles.notice}><Text style={{ color: '#065f46' }}>{msg}</Text></View>}
      {error && <View style={styles.err}><Text style={{ color: colors.danger }}>{error}</Text></View>}

      {mode === 'signup' && (
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      )}
      {mode !== 'verify' && (
        <>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        </>
      )}
      {mode === 'verify' && (
        <Field label="6-digit code (sent to your email)" value={code} onChangeText={setCode} placeholder="123456" keyboardType="number-pad" />
      )}

      <Pressable
        style={[styles.primary, busy && { opacity: 0.6 }]}
        disabled={busy}
        onPress={mode === 'login' ? doLogin : mode === 'signup' ? doSignup : doVerify}
      >
        <Text style={styles.primaryText}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : mode === 'signup' ? 'Sign up' : 'Verify & continue'}
        </Text>
      </Pressable>

      {mode === 'verify' ? (
        <Pressable onPress={doResend} style={styles.link}><Text style={styles.linkText}>Resend code</Text></Pressable>
      ) : (
        <Pressable onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMsg(null) }} style={styles.link}>
          <Text style={styles.linkText}>{mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}</Text>
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

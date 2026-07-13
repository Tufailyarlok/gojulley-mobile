import { Fragment } from 'react'
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import Svg, { Circle, Defs, Line, LinearGradient, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { colors, radius, sp } from '../lib/theme'

type PlaceKey = 'leh' | 'nubra' | 'turtuk' | 'pangong' | 'zanskar'

const POS: Record<PlaceKey, { x: number; y: number }> = {
  leh: { x: 400, y: 312 },
  nubra: { x: 338, y: 150 },
  turtuk: { x: 168, y: 92 },
  pangong: { x: 662, y: 360 },
  zanskar: { x: 214, y: 432 },
}

const ROUTES: { from: PlaceKey; to: PlaceKey; label?: string; dashed?: boolean }[] = [
  { from: 'leh', to: 'nubra', label: 'Khardung La' },
  { from: 'nubra', to: 'turtuk' },
  { from: 'leh', to: 'pangong', label: 'Chang La' },
  { from: 'leh', to: 'zanskar', label: 'via Kargil' },
  { from: 'nubra', to: 'pangong', label: 'Shyok', dashed: true },
]

const PLACES: { key: PlaceKey; name: string; meta: string; access: string; permit?: boolean; doList: string[] }[] = [
  {
    key: 'leh',
    name: 'Leh',
    meta: 'Your base · 3,500 m',
    access: 'Where every trip starts — fly in and rest a day to acclimatise before the high passes.',
    doList: [
      'Shanti Stupa & Leh Palace at sunset',
      'Wander the old-town bazaar',
      'Day trip to Thiksey, Hemis & Shey monasteries',
      'Magnetic Hill & Sangam (Indus–Zanskar confluence)',
    ],
  },
  {
    key: 'nubra',
    name: 'Nubra Valley',
    meta: 'Over Khardung La · ~150 km',
    access: '5–6 hrs from Leh across Khardung La (5,359 m).',
    permit: true,
    doList: [
      'Bactrian (two-hump) camel ride on the Hunder sand dunes',
      'Diskit Monastery & the giant Maitreya Buddha',
      'ATV / quad biking across the cold-desert dunes',
      'Hot springs at Panamik',
    ],
  },
  {
    key: 'turtuk',
    name: 'Turtuk',
    meta: 'Balti border village',
    access: 'A day trip beyond Nubra — one of India’s last villages before the border.',
    permit: true,
    doList: [
      'Walk the apricot orchards & centuries-old Balti houses',
      'Turtuk waterfall & viewpoints',
      'Meet the Balti community and taste local apricot dishes',
    ],
  },
  {
    key: 'pangong',
    name: 'Pangong Tso',
    meta: 'Over Chang La · ~220 km',
    access: '5–6 hrs from Leh across Chang La (5,360 m).',
    permit: true,
    doList: [
      'Watch the lake shift blue-to-turquoise through the day',
      'Camp lakeside under the stars',
      'Sunrise over the water & astro-photography',
    ],
  },
  {
    key: 'zanskar',
    name: 'Zanskar',
    meta: 'Via Kargil · for the adventurous',
    access: 'A longer loop via Kargil — best on an 8-day-plus trip.',
    doList: [
      'White-water rafting through the Zanskar gorge',
      'Remote monasteries — Phugtal, Karsha',
      'Padum and the high valley villages',
    ],
  },
]

const ITINERARIES: { days: string; title: string; stops: string; blurb: string }[] = [
  { days: '3 days', title: 'Leh & monasteries', stops: 'Leh', blurb: 'Old town, Shanti Stupa and the great monasteries — no high passes, gentle on altitude.' },
  { days: '5 days', title: 'Leh + Nubra', stops: 'Leh · Nubra', blurb: 'Add the camel dunes and Diskit, over Khardung La.' },
  { days: '7 days', title: 'The classic circuit', stops: 'Leh · Nubra · Pangong', blurb: 'The full loop — dunes, the blue lake and two of the world’s highest passes.' },
  { days: '9 days', title: 'Complete Ladakh', stops: 'Leh · Nubra · Turtuk · Pangong', blurb: 'Everything, unhurried — plus the border village of Turtuk.' },
]

const MAP_W = Dimensions.get('window').width - sp(8)
const MAP_H = MAP_W * (500 / 820)

export default function Explore() {
  const router = useRouter()
  return (
    <ScrollView contentContainerStyle={{ padding: sp(4), paddingBottom: sp(12) }}>
      <Text style={styles.eyebrow}>EXPLORE LADAKH</Text>
      <Text style={styles.h1}>Where to go &amp; what you can do</Text>
      <Text style={styles.sub}>
        Rent a taxi or a self-drive bike for a few days and this is your playground — then build your own trip or grab a
        ready-made package.
      </Text>

      <View style={styles.mapWrap}>
        <Svg width={MAP_W} height={MAP_H} viewBox="0 0 820 500">
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#eaf1ff" />
              <Stop offset="1" stopColor="#f6f1e7" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="820" height="500" fill="url(#sky)" />
          <Polygon points="0,500 0,330 150,250 320,330 480,240 640,320 820,250 820,500" fill="#dfe6f5" opacity={0.7} />
          <Polygon points="0,500 0,400 180,330 380,400 560,330 760,400 820,370 820,500" fill="#e7e0d0" opacity={0.6} />

          {ROUTES.map((r, i) => {
            const a = POS[r.from]
            const b = POS[r.to]
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <Fragment key={i}>
                <Line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#28328c"
                  strokeWidth={r.dashed ? 1.5 : 2.5}
                  strokeDasharray={r.dashed ? '5 6' : undefined}
                  opacity={r.dashed ? 0.4 : 0.65}
                  strokeLinecap="round"
                />
                {r.label ? (
                  <>
                    <Rect x={mx - r.label.length * 3.6 - 6} y={my - 20} width={r.label.length * 7.2 + 12} height={16} rx={8} fill="#ffffff" opacity={0.85} />
                    <SvgText x={mx} y={my - 8} fontSize={11} fill="#4b5563" textAnchor="middle">{r.label}</SvgText>
                  </>
                ) : null}
              </Fragment>
            )
          })}

          {PLACES.map((p) => {
            const { x, y } = POS[p.key]
            const hub = p.key === 'leh'
            return (
              <Fragment key={p.key}>
                <Circle cx={x} cy={y} r={hub ? 11 : 8} fill={hub ? '#199fd9' : '#28328c'} stroke="#fff" strokeWidth={3} />
                <Rect x={x + 14} y={y - 12} width={p.name.length * 8 + 16} height={24} rx={12} fill="#fff" stroke={colors.line} />
                <SvgText x={x + 22} y={y + 4} fontSize={13} fontWeight="800" fill="#111827">{p.name}</SvgText>
              </Fragment>
            )
          })}
        </Svg>
      </View>

      {PLACES.map((p) => (
        <View key={p.key} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.placeName}>{p.name}</Text>
            {p.permit ? (
              <View style={styles.permit}>
                <Text style={styles.permitText}>Permit sorted</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.meta}>{p.meta}</Text>
          <Text style={styles.access}>{p.access}</Text>
          {p.doList.map((d, i) => (
            <Text key={i} style={styles.li}>{'•  ' + d}</Text>
          ))}
        </View>
      ))}

      <Text style={[styles.eyebrow, { marginTop: sp(4) }]}>SUGGESTED ROUTES</Text>
      <Text style={styles.h2}>How many days do you have?</Text>
      {ITINERARIES.map((it) => (
        <View key={it.days} style={styles.card}>
          <View style={styles.daysPill}>
            <Text style={styles.daysText}>{it.days}</Text>
          </View>
          <Text style={styles.placeName}>{it.title}</Text>
          <Text style={styles.stops}>{it.stops}</Text>
          <Text style={styles.access}>{it.blurb}</Text>
        </View>
      ))}

      <View style={[styles.card, { alignItems: 'center', marginTop: sp(4) }]}>
        <Text style={styles.h2}>Ready to plan?</Text>
        <Pressable style={styles.primary} onPress={() => router.push('/trips')}>
          <Text style={styles.primaryText}>Browse packages</Text>
        </Pressable>
        <Pressable style={styles.outline} onPress={() => router.push('/search')}>
          <Text style={styles.outlineText}>Build your own trip</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.cyan, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  h1: { color: colors.ink, fontWeight: '900', fontSize: 24, marginTop: sp(1) },
  h2: { color: colors.ink, fontWeight: '800', fontSize: 20, marginTop: sp(1), marginBottom: sp(2) },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: sp(2), marginBottom: sp(4) },
  mapWrap: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, overflow: 'hidden', marginBottom: sp(4) },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: sp(4), marginBottom: sp(3) },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: sp(2) },
  placeName: { color: colors.ink, fontWeight: '800', fontSize: 17 },
  permit: { backgroundColor: '#fffbeb', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  permitText: { color: colors.amber, fontWeight: '800', fontSize: 11 },
  meta: { color: colors.cyan, fontWeight: '700', fontSize: 12.5, marginTop: sp(1) },
  access: { color: colors.muted, fontSize: 13.5, lineHeight: 19, marginTop: sp(2) },
  li: { color: colors.ink, fontSize: 13.5, lineHeight: 22, marginTop: 2 },
  stops: { color: colors.faint, fontWeight: '700', fontSize: 12.5, marginTop: 2 },
  daysPill: { alignSelf: 'flex-start', backgroundColor: '#eff6ff', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, marginBottom: sp(2) },
  daysText: { color: '#1d4ed8', fontWeight: '800', fontSize: 12 },
  primary: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(3), paddingHorizontal: sp(6), marginTop: sp(3) },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  outline: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingVertical: sp(3), paddingHorizontal: sp(6), marginTop: sp(2) },
  outlineText: { color: colors.navy, fontWeight: '800', fontSize: 15 },
})

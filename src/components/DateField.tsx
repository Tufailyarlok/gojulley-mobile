import { useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { SymbolView } from 'expo-symbols'
import { isoToDate, localISO, prettyDate, todayISO } from '../lib/money'
import { colors, radius, sp } from '../lib/theme'

/**
 * Tappable date field that opens a native calendar — the mobile counterpart of
 * the web's <input type="date">. `value`/`min`/`max` are YYYY-MM-DD strings;
 * `minimumDate`/`maximumDate` enforce the edge cases (e.g. no past dates), and
 * the picker itself guarantees a valid date so callers never parse typed input.
 *
 * iOS shows an inline calendar in a modal (commit on Done); Android uses the
 * platform dialog (commits on select, no-op on dismiss).
 */
export default function DateField({
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
}: {
  value: string
  onChange: (iso: string) => void
  min?: string
  max?: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const [temp, setTemp] = useState<Date>(() => isoToDate(value || min || todayISO()))

  const minimumDate = min ? isoToDate(min) : undefined
  const maximumDate = max ? isoToDate(max) : undefined

  function open() {
    setTemp(isoToDate(value || min || todayISO()))
    setShow(true)
  }

  // Android dialog: commit on "set", ignore on dismiss.
  function onAndroidChange(e: DateTimePickerEvent, d?: Date) {
    setShow(false)
    if (e.type === 'set' && d) onChange(localISO(d))
  }

  return (
    <>
      <Pressable style={styles.field} onPress={open} accessibilityRole="button" accessibilityLabel={placeholder}>
        <SymbolView name="calendar" size={16} tintColor={colors.faint} fallback={<Text style={{ fontSize: 14 }}>📅</Text>} />
        <Text style={value ? styles.text : styles.ph}>{value ? prettyDate(value) : placeholder}</Text>
      </Pressable>

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={temp}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onAndroidChange}
        />
      )}

      {Platform.OS !== 'android' && (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <DateTimePicker
                value={temp}
                mode="date"
                display="inline"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
                accentColor={colors.navy}
                onChange={(_e, d) => d && setTemp(d)}
                style={{ alignSelf: 'stretch' }}
              />
              <View style={styles.actions}>
                <Pressable onPress={() => setShow(false)} hitSlop={8}>
                  <Text style={styles.cancel}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(localISO(temp))
                    setShow(false)
                  }}
                  style={styles.done}
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(2),
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: sp(3),
    paddingVertical: sp(3),
  },
  text: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  ph: { color: colors.faint, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: sp(6) },
  sheet: { backgroundColor: '#fff', borderRadius: radius.lg, padding: sp(4) },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: sp(4), marginTop: sp(2) },
  cancel: { color: colors.faint, fontWeight: '700', fontSize: 15 },
  done: { backgroundColor: colors.navy, borderRadius: radius.md, paddingVertical: sp(2.5), paddingHorizontal: sp(6) },
  doneText: { color: '#fff', fontWeight: '800', fontSize: 15 },
})

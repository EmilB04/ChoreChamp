import { useTheme } from '@/contexts/ThemeContext';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type Props = {
  visible: boolean;
  date: Date;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DatePickerModal({ visible, date, minDate, maxDate, onClose, onConfirm, title }: Props) {
  const { colors } = useTheme();
  const [current, setCurrent] = useState<string>(toISODate(date));

  const marked = useMemo(() => ({
    [current]: { selected: true, selectedColor: colors.tint, selectedTextColor: colors.darkText },
  }), [current, colors.tint, colors.darkText]);

  if (!visible) return null;

  return (
    <View 
      style={styles.overlay}
      accessibilityViewIsModal={true}
      importantForAccessibility="yes"
    >
      <View style={[styles.card, { backgroundColor: colors.contextBackground }]}>
        {title ? (
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        ) : null}

        <Calendar
          current={current}
          minDate={minDate ? toISODate(minDate) : undefined}
          maxDate={maxDate ? toISODate(maxDate) : undefined}
          onDayPress={(day: { dateString: string }) => setCurrent(day.dateString)}
          markedDates={marked}
          theme={{
            calendarBackground: colors.contextBackground,
            dayTextColor: colors.text,
            monthTextColor: colors.text,
            textDisabledColor: colors.lightNonInteractiveText,
            arrowColor: colors.tint,
            todayTextColor: colors.activeText,
          }}
        />

        <View style={styles.buttons}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.buttonText, { color: colors.lightDarkText }]}>Avbryt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const next = new Date(current + 'T00:00:00');
              onConfirm(next);
            }}
          >
            <Text style={[styles.buttonText, { color: colors.tint }]}>Velg</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '92%',
    borderRadius: 16,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

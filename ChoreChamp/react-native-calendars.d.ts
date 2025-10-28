declare module 'react-native-calendars' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface CalendarProps extends ViewProps {
    current?: string;
    minDate?: string;
    maxDate?: string;
    onDayPress?: (day: { dateString: string }) => void;
    markedDates?: Record<string, any>;
    theme?: Record<string, any>;
  }

  export class Calendar extends React.Component<CalendarProps> {}
}

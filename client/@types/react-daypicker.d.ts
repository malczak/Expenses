declare module 'react-daypicker' {
  import React from 'react';

  interface DayPickerProps {
    monthNames?: string[];

    longDayNames?: string[];

    shortDayNames?: string[];

    onDayClick?: (date: Date) => void;
  }

  export default class DayPicker extends React.Component<DayPickerProps> {}
}

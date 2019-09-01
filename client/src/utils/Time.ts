import moment from 'moment';

export type TypePeriodDelta = {
  value: number;
  key: 'day' | 'week' | 'month' | 'year';
};

export type TimePeriod = {
  begin: Date;
  end: Date;
  delta: TypePeriodDelta;
};

const offsetDate = (
  date: Date,
  delta: TypePeriodDelta,
  direction: 'future' | 'past'
) =>
  moment(date)
    .startOf('day')
    .add((direction === 'past' ? -1 : 1) * delta.value, delta.key);

export function getNextPeriod(period: TimePeriod): TimePeriod {
  const delta = period.delta;
  const begin = offsetDate(period.begin, delta, 'future')
    .startOf('day')
    .toDate();
  const end = offsetDate(period.end, delta, 'future')
    .endOf('day')
    .toDate();
  return {
    begin,
    end,
    delta
  };
}

export function getPrevPeriod(period: TimePeriod): TimePeriod {
  const delta = period.delta;
  const begin = offsetDate(period.begin, delta, 'past')
    .startOf('day')
    .toDate();
  const end = offsetDate(period.end, delta, 'past')
    .endOf('day')
    .toDate();
  return {
    begin,
    end,
    delta
  };
}

export function createDayPeriod(date: Date): TimePeriod {
  return createPeriod(date, date, { value: 1, key: 'day' });
}

export const createTodayPeriod = () => createDayPeriod(new Date());

export const createThisWeekPeriod = () => {
  const date = new Date();
  return createPeriod(
    moment(date)
      .startOf('week')
      .toDate(),
    moment(date)
      .endOf('week')
      .toDate(),
    {
      value: 1,
      key: 'week'
    }
  );
};

export function createPeriod(
  begin: Date,
  end: Date,
  delta: TypePeriodDelta
): TimePeriod {
  return {
    begin: moment(begin)
      .startOf('day')
      .toDate(),
    end: moment(end)
      .endOf('day')
      .toDate(),
    delta
  };
}

export const isSingleDayPeriod = (period: TimePeriod) =>
  moment(period.end).diff(moment(period.begin), 'days') <= 1;

export const timePeriodsAreEqual = (t1: TimePeriod, t2: TimePeriod) =>
  t1 &&
  t2 &&
  t1.delta &&
  t2.delta &&
  t1.begin.getTime() == t2.begin.getTime() &&
  t1.end.getTime() == t2.end.getTime() &&
  t1.delta.key == t2.delta.key &&
  t1.delta.value == t2.delta.value;

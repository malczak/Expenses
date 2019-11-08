import moment from 'moment';
import Money from 'cents';
import { Expense } from 'app/models/Expense';

export type DayExpenses = {
  id: string;
  date: Date;
  total: Money;
  expenses: Expense[];
};

export function createDayExpenses(expenses: Expense[]): DayExpenses[] {
  if (!expenses || !expenses.length) return [];

  const dayExpensesMap = expenses.reduce((map, expense) => {
    const expenseDate = moment(expense.date);
    const dayStr = expenseDate.format('DDMMYY');

    let dayExpenses: DayExpenses = map.get(dayStr);
    if (!dayExpenses) {
      dayExpenses = {
        id: dayStr,
        date: expenseDate.startOf('day').toDate(),
        total: Money.cents(0),
        expenses: []
      };
      map.set(dayStr, dayExpenses);
    }

    dayExpenses.expenses.push(expense);
    dayExpenses.total = dayExpenses.total.add(expense.amount);

    return map;
  }, new Map<string, DayExpenses>());

  const dayExpenses = [...dayExpensesMap.values()];

  if (dayExpenses.length > 1) {
    return dayExpenses.sort((a, b) =>
      a.date.getTime() < b.date.getTime() ? -1 : 1
    );
  }

  return dayExpenses;
}

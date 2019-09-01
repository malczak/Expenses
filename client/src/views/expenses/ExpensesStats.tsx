import React from 'React';
import accounting from 'accounting';
import { Expense } from 'app/models/Expense';
import Money from 'cents';

const capitalize = (str: string) =>
  `${str.substr(0, 1).toUpperCase()}${str.substring(1).toLowerCase()}`;

const moneyFormatter = (money: Money) =>
  accounting.formatMoney(money.toFixed(), { format: '%v' });

function mapByStats(
  expenses: Expense[],
  getExpenseStatId: (expense: Expense) => string
): StatsItem[] {
  const statsMap = new Map<string, StatsItem>();

  for (const expense of expenses) {
    const statId = getExpenseStatId(expense);
    let statInfo = statsMap.get(statId);
    if (!statInfo) {
      statInfo = {
        name: statId,
        value: Money.cents(0)
      } as StatsItem;
      statsMap.set(statId, statInfo);
    }
    statInfo.value = statInfo.value.add(expense.amount);
  }

  const categoryStats = [...statsMap.values()].filter(
    categoryInfo => !categoryInfo.value.isZero()
  );

  return categoryStats.sort((a, b) => (a.value.greaterThan(b.value) ? -1 : 1));
}

type StatsItem = {
  name: string;
  value: Money;
};

type ExpensesStatsProps = {
  expenses: Expense[];
};

export class ExpensesStats extends React.Component<ExpensesStatsProps> {
  getExpenseStats(): StatsItem[] {
    let result = [] as StatsItem[];
    const expenses = this.props.expenses;

    result = result.concat(
      mapByStats(expenses, expense =>
        (expense.category || 'Brak').toLowerCase()
      )
    );

    result = result.concat(
      mapByStats(expenses, expense => expense.user.toLowerCase())
    );

    return result;
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const stats = this.getExpenseStats();
    return (
      <ul className="expenses-stats">
        {stats.map(stat => (
          <li className="expenses-stats__item">
            <span>{capitalize(stat.name)}</span>
            <span className="expenses-stats__itemvalue">
              {moneyFormatter(stat.value)}
            </span>
          </li>
        ))}
      </ul>
    );
  }
}

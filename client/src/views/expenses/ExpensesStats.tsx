import React from 'React';
import accounting from 'accounting';
import { Expense } from 'app/models/Expense';
import Money from 'cents';
import { capitalize } from 'app/utils/string';

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

type Stats = {
  grandTotal: Money;
  items: StatsItem[];
};

type ExpensesStatsProps = {
  expenses: Expense[];
};

export class ExpensesStats extends React.Component<ExpensesStatsProps> {
  getExpenseStats(): Stats {
    let items = [] as StatsItem[];
    const expenses = this.props.expenses;

    const grandTotal = expenses.reduce((sum: Money, expense: Expense) => {
      return sum.add(expense.amount);
    }, Money.cents(0));

    items = items.concat(
      mapByStats(expenses, expense =>
        (expense.category || 'Brak').toLowerCase()
      )
    );

    items = items.concat(
      mapByStats(expenses, expense => expense.user.toLowerCase())
    );

    return {
      grandTotal,
      items
    };
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const stats = this.getExpenseStats();
    return (
      <div className="expenses-stats">
        <div className="expenses-stats__header">
          <div>Podsumowanie</div>
          <div>
            <span>
              <strong>{moneyFormatter(stats.grandTotal)}</strong>
            </span>
            <small>zł</small>
          </div>
        </div>
        <ul>
          {stats.items.map(stat => (
            <li className="expenses-item">
              <div className="expense-item__content">
                {/* <div className="expense-item__header">
                <div className="expense-item__time">Podsumowanie</div>
              </div> */}
                <div className="expense-item__data">
                  <div className="expense-item__desc">
                    {capitalize(stat.name)}
                  </div>
                  <div className="expense-item__amount">
                    <span>{moneyFormatter(stat.value)}</span>
                    <small>zł</small>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

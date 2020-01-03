import React from 'React';
import { inject } from 'mobx-react';
import accounting from 'accounting';
import { Users } from 'app/data';
import { Expense } from 'app/models/Expense';
import Money from 'cents';
import { capitalize } from 'app/utils/string';
import { ChevronRight, ChevronLeft } from '../components/MoneyPad/icons';
import { StoreProps } from 'app/stores/AppStore';

type StatItem = {
  name: string;
  value: Money;
};

type StatsItem = StatItem & {
  uid: string;
  items: Expense[];
  users: StatItem[];
};

type Stats = {
  grandTotal: Money;
  items: StatsItem[];
};

type ExpensesStatsProps = {
  expenses: Expense[];
};

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
        uid: `${statId}:${Date.now()}`,
        name: statId,
        value: Money.cents(0),
        items: [],
        users: []
      } as StatsItem;
      statsMap.set(statId, statInfo);
    }
    statInfo.value = statInfo.value.add(expense.amount);
    statInfo.items.push(expense);

    let userInfo = statInfo.users.find(item => item.name == expense.user);
    if (!userInfo) {
      userInfo = {
        name: expense.user,
        value: Money.cents(0)
      };
      statInfo.users.push(userInfo);
    }
    userInfo.value = userInfo.value.add(Money.from(expense.amount));
  }

  const categoryStats = [...statsMap.values()].filter(
    categoryInfo => !categoryInfo.value.isZero()
  );

  return categoryStats.sort((a, b) => (a.value.greaterThan(b.value) ? -1 : 1));
}

const Bar: React.FC<{ items: StatItem[]; [key: string]: any }> = ({
  items,
  ...others
}) => {
  const distribution = [];
  const sum = Money.cents(0);
  for (const item of items) {
    let upper = sum.add(item.value);
    distribution.push({
      name: item.name,
      lower: sum.cents,
      upper: upper.cents
    });
    sum.set(upper);
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${sum.cents} 20`}
      preserveAspectRatio="none"
      {...others}
    >
      {distribution.map(item => {
        const user = Users.find(user => user.name == item.name);
        return (
          <rect
            key={item.name}
            x={item.lower}
            y="0"
            width={item.upper - item.lower}
            height="100%"
            fill={user.color}
          />
        );
      })}
    </svg>
  );
};

@inject('appStore')
export class ExpensesStats extends React.Component<
  ExpensesStatsProps & StoreProps
> {
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
            <li
              key={stat.uid}
              className="expenses-item"
              onClick={() => this.props.appStore.tmp_setExpensesList(stat)}
            >
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
                  <ChevronRight />
                </div>
                <div className="expense-item__footer">
                  <small>
                    {stat.users.map(userStat => (
                      <small key={userStat.name} className="mr-2">
                        {userStat.name}:&nbsp;
                        <span>
                          <strong>
                            {moneyFormatter(userStat.value).replace(' ', ' ')}
                          </strong>
                          zł
                        </span>
                      </small>
                    ))}
                  </small>
                  <Bar width="100%" height={4} items={stat.users} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

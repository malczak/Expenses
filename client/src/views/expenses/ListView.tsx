import React from 'react';
import accounting from 'accounting';
import moment from 'moment';
import { StoreProps } from 'app/stores/AppStore';
import { inject, observer } from 'mobx-react';
import { Expense } from 'app/models/Expense';
import {
  getIconByName,
  UploadIcon,
  ChevronLeft,
  ChevronRight,
  Refresh
} from '../components/MoneyPad/icons';
import { getCategoryByName } from 'app/data';
import Money from 'cents';

const moneyFormatter = (money: Money) =>
  accounting.formatMoney(money.toFixed(), { format: '%v' });
const fullDateFormatter = (date: Date) => moment(date).format('l LT');
const timeOnlyFormatter = (date: Date) => moment(date).format('LT');

type ExpenseViewProps = {
  expense: Expense;
  moneyFormatter: (money: Money) => string;
  dateFormatter: (date: Date) => string;
};

type DayExpenses = {
  id: string;
  date: Date;
  total: Money;
  expenses: Expense[];
};

class ExpenseView extends React.PureComponent<ExpenseViewProps> {
  render() {
    const { expense, moneyFormatter, dateFormatter } = this.props;
    const category = getCategoryByName(expense.category);
    const Icon = category ? getIconByName(category.icon) : null;
    return (
      <div className="expenses-item" data-id={expense.id}>
        <div className="expense-item__header">
          <div className="expense-item__time">
            {dateFormatter(expense.date)}
          </div>
          {!expense.synchronized && <UploadIcon color={'red'} />}
        </div>
        <div className="expense-item__content">
          {expense.description ? (
            <div className="expense-item__desc">{expense.description}</div>
          ) : (
            <div className="expense-item__user">
              {category ? category.name : expense.user}
            </div>
          )}
          <div className="expense-item__amount">
            <span>{moneyFormatter(expense.amount)}</span>
            <small>zł</small>
          </div>
        </div>
        <div className="expense-item__footer">
          <small>{expense.user} in</small>
          <div className="expense-item__category">
            {Icon && (
              <span>
                <Icon width="100%" height="100%" />
              </span>
            )}
            <small>{category ? category.name : '-'}</small>
          </div>
        </div>
      </div>
    );
  }
}

const DayExpenses: React.FC<{
  day: DayExpenses;
  onRefresh?: (date: DayExpenses) => void;
}> = ({ day, onRefresh = () => {} }) => {
  return (
    <div className="expenses-day">
      <div className="expenses-day__header">
        {moment(day.date).format('LL')}
        <button
          className="expenses-day__refresh"
          onClick={() => onRefresh(day)}
        >
          <Refresh />
        </button>
      </div>

      <div className="expenses-day__content">
        {day.expenses.map(expense => (
          <ExpenseView
            key={expense.id}
            expense={expense}
            moneyFormatter={moneyFormatter}
            dateFormatter={timeOnlyFormatter}
          />
        ))}
      </div>

      <div className="expenses-day__summary">
        Suma:
        <span className="expenses-day__summary__amount">
          {moneyFormatter(day.total)}
        </span>
      </div>
    </div>
  );
};

type ListExpensesProps = {};

@inject('appStore')
@observer
export class ListExpensesView extends React.Component<
  ListExpensesProps & StoreProps
> {
  // -----------------------
  // Handlers
  // -----------------------
  onDayRefresh = (day: DayExpenses) => {
    this.props.appStore.fetchDateExpenses(day.date);
  };

  gotoPrevDay = () => {
    const date = moment(this.props.appStore.date)
      .subtract(1, 'day')
      .toDate();
    this.props.appStore.fetchDateExpenses(date);
  };

  gotoNextDay = () => {
    const date = moment(this.props.appStore.date)
      .add(1, 'day')
      .toDate();
    this.props.appStore.fetchDateExpenses(date);
  };

  // -----------------------
  // Methods
  // -----------------------
  groupByDay(): DayExpenses[] {
    const expenses = this.props.appStore.expenses;
    if (!expenses || !expenses.isAvailable) return [];

    const dayExpensesMap = expenses.value.reduce((map, expense) => {
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
    return dayExpenses.length > 1
      ? dayExpenses.sort((a, b) =>
          a.date.getTime() < b.date.getTime() ? -1 : 1
        )
      : dayExpenses;
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const expenses = this.props.appStore.expenses;
    const currentDate = this.props.appStore.date;
    const groupedExpenses = this.groupByDay();

    // if (!groupedExpenses.length) {
    //   return (
    //     <div className="screen-view expenses-list expenses-list--empty">
    //       <div>No expenses 💸</div>
    //     </div>
    //   );
    // }

    const prevDate = moment(currentDate)
      .subtract(1, 'day')
      .startOf('day');
    const nextDate = moment(currentDate)
      .add(1, 'day')
      .startOf('day');
    const nextDateInFuture = nextDate.isAfter(moment());
    const isEmpty =
      expenses.isEmpty || (expenses.isAvailable && groupedExpenses.length == 0);

    return (
      <div className="screen-view">
        <div className="navigation-bar">
          <button className="navigation-bar__button" onClick={this.gotoPrevDay}>
            <ChevronLeft />
            {prevDate.format('D/MM')}
          </button>
          {!nextDateInFuture && (
            <button
              className="navigation-bar__button navigation-bar__button--reverse"
              onClick={this.gotoNextDay}
            >
              <ChevronRight />
              {nextDate.format('D/MM')}
            </button>
          )}
        </div>
        <div className="expenses-list">
          {isEmpty ? (
            <div>No expenses 💸</div>
          ) : expenses.isLoading ? (
            <div>Loading expenses 💸</div>
          ) : (
            expenses.isAvailable &&
            groupedExpenses.map(dayExpenses => (
              <DayExpenses
                key={dayExpenses.id}
                day={dayExpenses}
                onRefresh={this.onDayRefresh}
              />
            ))
          )}
        </div>
      </div>
    );
  }
}

import React from 'react';
import moment from 'moment';
import Tocca from 'tocca';
import { inject, observer } from 'mobx-react';
import capitalize from 'lodash.capitalize';
import Money from 'cents';

import { StoreProps } from 'app/stores/AppStore';
import { Expense } from 'app/models/Expense';
import { DropDown } from 'app/views/components/Dropdown';
import { ChevronLeft, ChevronRight } from 'app/views/components/MoneyPad/icons';

import {
  getNextPeriod,
  getPrevPeriod,
  isSingleDayPeriod
} from 'app/utils/Time';

import { DayExpenses, ExpansesList } from './ExpansesList';
import { ExpensesStats } from './ExpensesStats';

const $TOCCA = Tocca;

const StatOptions = [
  { value: 'day', label: 'Dzienny' },
  { value: 'week', label: 'Tygodniowy' },
  { value: 'month', label: 'Miesieczny' }
];

type ListExpensesProps = {
  onExpenseEdit: (expense: Expense) => void;
  onExpenseDelete: (expense: Expense) => void;
};

@inject('appStore')
@observer
export class ListExpensesView extends React.Component<
  ListExpensesProps & StoreProps
> {
  // -----------------------
  // Handlers
  // -----------------------
  onPeriodSelect = (id: string, close: () => void) => {
    switch (id) {
      case 'day':
        this.props.appStore.$fetchTodaysExpenses();
        break;
      case 'week':
        this.props.appStore.$fetchWeekExpenses();
        break;
      case 'month':
        this.props.appStore.$fetchMonthExpenses();
        break;
    }
    close();
  };

  onDayRefresh = (day: DayExpenses) => {
    this.props.appStore.$fetchPeriodExpenses(this.props.appStore.period);
  };

  gotoPrevPeriod = () => {
    const period = getPrevPeriod(this.props.appStore.period);
    this.props.appStore.$fetchPeriodExpenses(period);
  };

  gotoNextPeriod = () => {
    const period = getNextPeriod(this.props.appStore.period);
    this.props.appStore.$fetchPeriodExpenses(period);
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

    if (dayExpenses.length > 1) {
      return dayExpenses.sort((a, b) =>
        a.date.getTime() < b.date.getTime() ? -1 : 1
      );
    }

    return dayExpenses;
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const expenses = this.props.appStore.expenses;
    const currentPeriod = this.props.appStore.period;
    const groupedExpenses = this.groupByDay();

    // if (!groupedExpenses.length) {
    //   return (
    //     <div className="screen-view expenses-list expenses-list--empty">
    //       <div>No expenses 💸</div>
    //     </div>
    //   );
    // }

    const pervPeriod = getPrevPeriod(currentPeriod);
    const nextPeriod = getNextPeriod(currentPeriod);
    const prevDate = moment(pervPeriod.begin);
    const nextDate = moment(nextPeriod.begin);

    const nextDateInFuture = nextDate.isAfter(moment());

    const isEmpty =
      expenses.isEmpty || (expenses.isAvailable && groupedExpenses.length == 0);

    const isSingleDay = isSingleDayPeriod(currentPeriod);
    const showStats = !isSingleDay;

    return (
      <div className="screen-view">
        <div className="navigation-bar">
          <button
            className="navigation-bar__button"
            onClick={this.gotoPrevPeriod}
          >
            <ChevronLeft />
            {prevDate.format('D/MM')}
          </button>

          <div className="navigation-bar__title">
            <DropDown
              title={(value: string | null): string =>
                value
                  ? capitalize(
                      StatOptions.find(option => option.value == value).label
                    )
                  : 'Wybierz'
              }
              options={StatOptions}
              selected={StatOptions[0].value}
              onChange={this.onPeriodSelect}
            />
          </div>

          {!nextDateInFuture && (
            <button
              className="navigation-bar__button navigation-bar__button--reverse"
              onClick={this.gotoNextPeriod}
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
            expenses.isAvailable && (
              <>
                {showStats && <ExpensesStats expenses={expenses.value} />}
                <ExpansesList
                  expenses={groupedExpenses}
                  onExpenseEdit={this.props.onExpenseEdit}
                  onExpenseDelete={this.props.onExpenseDelete}
                  onDayRefresh={this.onDayRefresh}
                />
              </>
            )
          )}
        </div>
      </div>
    );
  }
}

import React from 'react';
import accounting from 'accounting';
import moment from 'moment';
import { StoreProps } from 'app/stores/AppStore';
import { inject, observer } from 'mobx-react';
import { Expense } from 'app/models/Expense';
import { getIconByName, UploadIcon } from '../components/MoneyPad/icons';
import { getCategoryByName } from 'app/data';
import Money from 'cents';

const moneyFormatter = (money: Money) =>
  accounting.formatMoney(money.toFixed());
const fullDateFormatter = (date: Date) => moment(date).format('l LT');
const timeOnlyFormatter = (date: Date) => moment(date).format('LT');

type ExpenseViewProps = {
  expense: Expense;
  moneyFormatter: (money: Money) => string;
  dateFormatter: (date: Date) => string;
};

class ExpenseView extends React.PureComponent<ExpenseViewProps> {
  render() {
    const { expense, moneyFormatter, dateFormatter } = this.props;
    const category = getCategoryByName(expense.category);
    const Icon = category ? getIconByName(category.icon) : null;
    return (
      <div className="expenses-list__item" data-id={expense.id}>
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
            {moneyFormatter(expense.amount)}
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

type ListExpensesProps = {};

@inject('appStore')
@observer
export class ListExpensesView extends React.Component<
  ListExpensesProps & StoreProps
> {
  // -----------------------
  // Methods
  // -----------------------
  sameDayData() {
    const expenses = this.props.appStore.expenses;
    if (!expenses || !expenses.length) return false;

    const dateToDay = (date: Date) => moment(date).format('DDMMYY');
    const commonDate = dateToDay(expenses[0].date);
    return expenses.every(expense => dateToDay(expense.date) == commonDate);
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const expenses = this.props.appStore.expenses;

    if (!expenses.length) {
      return (
        <div className="screen-view expenses-list expenses-list--empty">
          <div>No expenses 💸</div>
        </div>
      );
    }

    const sameDayData = this.sameDayData();
    const sum = expenses.reduce((sum, expense) => {
      return sum.add(expense.amount);
    }, new Money(0));

    return (
      <div className="screen-view expenses-list">
        {sameDayData && (
          <div className="expenses-list__date">
            {moment(expenses[0].date).format('LL')}
          </div>
        )}

        <div className="expenses-list__content">
          {expenses.map(expense => (
            <ExpenseView
              key={expense.id}
              expense={expense}
              moneyFormatter={moneyFormatter}
              dateFormatter={
                sameDayData ? timeOnlyFormatter : fullDateFormatter
              }
            />
          ))}
        </div>

        <div className="expenses-summary">
          Suma:
          <span className="expenses-summary__amount">
            {moneyFormatter(sum)}
          </span>
        </div>
      </div>
    );
  }
}

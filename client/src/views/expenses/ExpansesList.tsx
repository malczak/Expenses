import React from 'react';
import { Expense } from 'app/models/Expense';
import { ExpensesView } from './ExpensesView';
import { DayExpenses } from 'app/utils/Expenses';

type ExpensesListProps = {
  expenses: DayExpenses[];
  allowRefresh?: boolean;
  allowCollapse?: boolean;
  onExpenseEdit?: (expense: Expense) => void;
  onExpenseDelete?: (expense: Expense) => void;
  onDayRefresh?: (date: DayExpenses) => void;
};

type ExpensesListState = {
  expenses?: DayExpenses[];
  collapsedDays: string[];
};

export class ExpansesList extends React.Component<
  ExpensesListProps,
  ExpensesListState
> {
  static defaultProps: { allowRefresh: true; allowCollapse: true };

  state: ExpensesListState = { collapsedDays: new Array<string>() };

  // -----------------------
  // Handlers
  // -----------------------
  onEditExpense = (expense: Expense) => {
    const { onExpenseEdit } = this.props;
    if (typeof onExpenseEdit === 'function') {
      onExpenseEdit(expense);
    }
  };

  onDeleteExpense = (expense: Expense) => {
    const { onExpenseDelete } = this.props;
    if (typeof onExpenseDelete === 'function') {
      onExpenseDelete(expense);
    }
  };

  onDayCollapse = (day: DayExpenses) => {
    const collapsedDays = this.state.collapsedDays.concat();
    const index = collapsedDays.findIndex(id => id == day.id);
    if (index > -1) {
      collapsedDays.splice(index, 1);
    } else {
      collapsedDays.splice(index, 0, day.id);
    }

    this.setState({
      collapsedDays
    });
  };

  // -----------------------
  // Lifecycle
  // -----------------------
  static getDerivedStateFromProps(
    props: ExpensesListProps,
    state: ExpensesListState
  ): ExpensesListState {
    const collapsedDays = [] as string[];
    if (props.expenses === state.expenses) {
      return state;
    }

    const expenses = props.expenses;
    if (expenses && expenses.length) {
      expenses.forEach(dayExpenses => collapsedDays.push(dayExpenses.id));
    }

    return { expenses: props.expenses, collapsedDays };
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { expenses, allowRefresh, allowCollapse } = this.props;
    const allowDayCollapse = allowCollapse && expenses.length > 1;
    return (
      <>
        {expenses.map(dayExpenses => (
          <ExpensesView
            key={dayExpenses.id}
            day={dayExpenses}
            allowRefresh={allowRefresh}
            allowCollapse={allowDayCollapse}
            collapsed={
              allowDayCollapse &&
              this.state.collapsedDays.includes(dayExpenses.id)
            }
            onEdit={this.onEditExpense}
            onDelete={this.onDeleteExpense}
            onRefresh={this.props.onDayRefresh}
            onCollapse={this.onDayCollapse}
          />
        ))}
      </>
    );
  }
}

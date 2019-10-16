import React from 'react';
import { StoreProps } from 'app/stores/AppStore';
import { Expense } from 'app/models/Expense';
import { CreateExpenseView } from './CreateView';

type EditExpenseViewProps = {
  expense: Expense;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
};

type EditExpenseViewState = {};

export class EditExpenseView extends React.PureComponent<
  EditExpenseViewProps & StoreProps,
  EditExpenseViewState
> {
  private view = React.createRef<CreateExpenseView>();

  // -----------------------
  // Handlers
  // -----------------------
  onSave = () => {
    const view = this.view.current;
    if (!view) {
      return;
    }

    const { onSave } = this.props;
    if (typeof onSave === 'function') {
      const existingExpense = this.props.expense;
      const expense = view.createExpense(existingExpense.clone());
      onSave(expense);
    }
  };

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { expense } = this.props;
    return (
      <CreateExpenseView
        ref={this.view}
        actionLabel="Zapisz"
        amount={expense.amount.cents}
        description={expense.description}
        category={expense.category}
        date={expense.date}
        onSave={this.onSave}
        onCancel={this.props.onCancel}
      />
    );
  }
}

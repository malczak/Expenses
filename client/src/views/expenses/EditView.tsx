import React from 'react';
import { MoneyPad } from 'app/views/components/MoneyPad';
import { StoreProps } from 'app/stores/AppStore';
import { ChevronLeft, UploadIcon } from '../components/MoneyPad/icons';
import { Expense } from 'app/models/Expense';

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
  private moneypad = React.createRef<MoneyPad>();

  // -----------------------
  // Handlers
  // -----------------------
  onSave = () => {
    const moneypad = this.moneypad.current;
    if (!moneypad) {
      return;
    }

    const { onSave } = this.props;
    if (typeof onSave === 'function') {
      const existingExpense = this.props.expense;
      const expense = moneypad.createExpense(existingExpense.clone());
      onSave(expense);
    }
  };

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { expense } = this.props;
    return (
      <div className="screen-view">
        <div className="navigation-bar">
          <button
            className="navigation-bar__button"
            onClick={() => this.props.onCancel()}
          >
            <ChevronLeft /> Anuluj
          </button>
          <button
            className="navigation-bar__button navigation-bar__button--reverse"
            onClick={this.onSave}
          >
            <UploadIcon /> Zapisz
          </button>
        </div>
        <MoneyPad
          ref={this.moneypad}
          amount={expense.amount.cents}
          description={expense.description}
          category={expense.category}
          onCreate={this.onSave}
        />
      </div>
    );
  }
}

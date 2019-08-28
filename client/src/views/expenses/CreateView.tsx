import React from 'react';
import { MoneyPad } from 'app/views/components/MoneyPad';
import { StoreProps } from 'app/stores/AppStore';
import { ChevronLeft, UploadIcon } from '../components/MoneyPad/icons';
import { Expense } from 'app/models/Expense';

type CreateExpenseViewProps = {
  onCreate: (expense: Expense) => void;
  onCancel: () => void;
};

type CreateExpenseViewState = {};

export class CreateExpenseView extends React.PureComponent<
  CreateExpenseViewProps & StoreProps,
  CreateExpenseViewState
> {
  private moneypad = React.createRef<MoneyPad>();

  // -----------------------
  // Handlers
  // -----------------------
  onCreate = () => {
    const moneypad = this.moneypad.current;
    if (!moneypad) {
      return;
    }
    const expense = moneypad.createExpense();
    const { onCreate } = this.props;
    if (typeof onCreate === 'function') {
      onCreate(expense);
    }
  };

  // -----------------------
  // Render
  // -----------------------
  render() {
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
            onClick={this.onCreate}
          >
            <UploadIcon /> Dodaj
          </button>
        </div>
        <MoneyPad ref={this.moneypad} onCreate={this.onCreate} />
      </div>
    );
  }
}

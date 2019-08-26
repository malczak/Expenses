import React from 'react';
import { MoneyPad } from 'app/views/components/MoneyPad';
import { StoreProps } from 'app/stores/AppStore';
import { ChevronLeft } from '../components/MoneyPad/icons';
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
  // -----------------------
  // Handlers
  // -----------------------
  onCreate = (expense: any) => {
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
            className="navigation-bar__back"
            onClick={() => this.props.onCancel()}
          >
            <ChevronLeft /> Anuluj
          </button>
        </div>
        <MoneyPad onCreate={this.onCreate} />
      </div>
    );
  }
}

// Core
import React from 'react';
import _pick from 'lodash.pick';

// Components
import { StoreProps } from 'app/stores/AppStore';
import { inject, observer } from 'mobx-react';
import { ListExpensesView } from 'app/views/expenses/ListView';
import { AddExpenseButton } from 'app/views/components/AddExpenseButton';
import { CreateExpenseView } from 'app/views/expenses/CreateView';
import { LoginView } from 'app/views/LoginView';
import { Expense } from 'app/models/Expense';

type MainViewProps = {};

type MainViewState = {
  isCreatingNew: boolean;
  busy: boolean;
};

@inject('appStore')
@observer
class MainView extends React.Component<
  MainViewProps & StoreProps,
  MainViewState
> {
  state = { isCreatingNew: false, busy: false };
  // -----------------------
  // Methods
  // -----------------------
  addExpense(expense: Expense) {
    this.props.appStore.addExpense(expense);
    this.setState({ isCreatingNew: false });
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { busy } = this.state;
    if (busy) {
      return <h2>Busy....</h2>;
    }

    if (!this.props.appStore.user) {
      return <LoginView />;
    }

    return (
      <div className="screen-view">
        <ListExpensesView />
        <AddExpenseButton
          onClick={() => this.setState({ isCreatingNew: true })}
        />
        {this.state.isCreatingNew && (
          <CreateExpenseView
            onCancel={() => this.setState({ isCreatingNew: false })}
            onCreate={expense => {
              this.addExpense(expense);
            }}
          />
        )}
      </div>
    );
  }
}

export default MainView;

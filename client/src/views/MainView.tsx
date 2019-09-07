// Core
import React from 'react';
import _pick from 'lodash.pick';

// Components
import { StoreProps } from 'app/stores/AppStore';
import { inject, observer } from 'mobx-react';
import { ListExpensesView } from 'app/views/expenses/ListView';
import { AddExpenseButton } from 'app/views/components/AddExpenseButton';
import { CreateExpenseView } from 'app/views/expenses/CreateView';
import { EditExpenseView } from 'app/views/expenses/EditView';
import { LoginView } from 'app/views/LoginView';
import { Expense } from 'app/models/Expense';

const enum ViewMode {
  showList = 1,
  createExpense = 2,
  editExpense = 3
}

type MainViewProps = {};

type MainViewState = {
  mode: ViewMode;
  busy: boolean;
  expense?: Expense;
};

@inject('appStore')
@observer
class MainView extends React.Component<
  MainViewProps & StoreProps,
  MainViewState
> {
  state: MainViewState = { mode: ViewMode.showList, busy: false };
  // -----------------------
  // Methods
  // -----------------------

  updateExpense(expense: Expense) {
    this.props.appStore.updateExpense(expense);
    this.setState({ mode: ViewMode.showList });
  }

  addExpense(expense: Expense) {
    this.props.appStore.addExpense(expense);
    this.setState({ mode: ViewMode.showList });
  }

  // -----------------------
  // Handlers
  // -----------------------
  onExpenseEdit = (expense: Expense) => {
    this.setState({
      mode: ViewMode.editExpense,
      expense: expense
    });
  };

  onExpenseDelete = (expense: Expense): Promise<Boolean> => {
    return new Promise<Boolean>(resolve => {
      const message = `Czy chcesz skasować wpis '${expense.description ||
        expense.category ||
        ''}'? `;

      if (confirm(message)) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).then(confirmed => {
      if (confirmed) {
        this.props.appStore.deleteExpense(expense);
      }
      return confirmed;
    });
  };

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
        <ListExpensesView
          onExpenseEdit={this.onExpenseEdit}
          onExpenseDelete={this.onExpenseDelete}
        />
        <AddExpenseButton
          onClick={() => this.setState({ mode: ViewMode.createExpense })}
        />

        {this.state.mode == ViewMode.createExpense && (
          <CreateExpenseView
            onCancel={() => this.setState({ mode: ViewMode.showList })}
            onCreate={expense => {
              this.addExpense(expense);
            }}
          />
        )}

        {this.state.mode == ViewMode.editExpense && (
          <EditExpenseView
            expense={this.state.expense}
            onCancel={() => this.setState({ mode: ViewMode.showList })}
            onSave={expense => {
              this.updateExpense(expense);
            }}
          />
        )}
      </div>
    );
  }
}

export default MainView;

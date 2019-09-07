import React from 'react';
import cn from 'classnames';
import accounting from 'accounting';
import moment from 'moment';
import { Expense, ExpenseState } from 'app/models/Expense';
import {
  getIconByName,
  UploadIcon,
  Refresh,
  ChevronUp,
  ChevronDown
} from '../components/MoneyPad/icons';
import { getCategoryByName } from 'app/data';
import Money from 'cents';

const moneyFormatter = (money: Money) =>
  accounting.formatMoney(money.toFixed(), { format: '%v' });

const fullDateFormatter = (date: Date) => moment(date).format('l LT');
const timeOnlyFormatter = (date: Date) => moment(date).format('LT');

export type DayExpenses = {
  id: string;
  date: Date;
  total: Money;
  expenses: Expense[];
};

type ExpenseViewProps = {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  moneyFormatter: (money: Money) => string;
  dateFormatter: (date: Date) => string;
};

type ExpenseViewState = {
  opened: Boolean;
};

export class ExpenseView extends React.PureComponent<
  ExpenseViewProps,
  ExpenseViewState
> {
  state = { opened: false };

  private el = React.createRef<HTMLDivElement>();

  // -----------------------
  // Handlers
  // -----------------------
  onSwipeLeft = () => {
    const { opened } = this.state;
    if (!opened) {
      this.setState({ opened: true });
    }
  };

  onSwipeRight = () => {
    const { opened } = this.state;
    if (opened) {
      this.setState({ opened: false });
    }
  };

  // -----------------------
  // Lifecycle
  // -----------------------

  componentDidMount() {
    const $el = this.el.current;
    if ($el) {
      $el.addEventListener('swipeleft', this.onSwipeLeft);
      $el.addEventListener('swiperight', this.onSwipeRight);
      $el.addEventListener('click', this.onSwipeRight);
    }
  }

  componentWillUnmount() {
    const $el = this.el.current;
    if ($el) {
      $el.removeEventListener('swipeleft', this.onSwipeLeft);
      $el.removeEventListener('swiperight', this.onSwipeRight);
      $el.removeEventListener('click', this.onSwipeRight);
    }
  }

  // -----------------------
  // Render
  // -----------------------
  renderStateIcon(expense: Expense) {
    switch (expense.getState()) {
      case ExpenseState.created:
        return <UploadIcon color={'black'} />;
      case ExpenseState.edited:
        return <UploadIcon color={'green'} />;
      case ExpenseState.deleted:
        return <UploadIcon color={'red'} />;
    }
  }

  render() {
    const { opened } = this.state;
    const {
      expense,
      moneyFormatter,
      dateFormatter,
      onEdit,
      onDelete
    } = this.props;

    const category = getCategoryByName(expense.category);
    const Icon = category ? getIconByName(category.icon) : null;

    return (
      <div
        ref={this.el}
        className={cn('expenses-item', {
          'expenses-item--closed': !opened,
          'expenses-item--opened': opened
        })}
        data-id={expense.id}
      >
        <div className="expense-item__actions">
          <button
            className={cn('button-neutral-bg')}
            onClick={() => onEdit(expense)}
          >
            edit
          </button>
          <button
            className={cn('button-negative-bg')}
            onClick={() => onDelete(expense)}
          >
            delete
          </button>
        </div>
        <div className="expense-item__content">
          <div className="expense-item__header">
            <div className="expense-item__time">
              {dateFormatter(expense.date)}
            </div>
            {this.renderStateIcon(expense)}
          </div>
          <div className="expense-item__data">
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
      </div>
    );
  }
}

export const DayExpenses: React.FC<{
  day: DayExpenses;
  allowCollapse: boolean;
  collapsed: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onCollapse?: (date: DayExpenses) => void;
  onRefresh?: (date: DayExpenses) => void;
}> = ({
  day,
  allowCollapse,
  collapsed,
  onEdit,
  onDelete,
  onCollapse,
  onRefresh = () => {}
}) => {
  const CollapseIcon = collapsed ? ChevronDown : ChevronUp;
  const isCollapsed = allowCollapse && collapsed;
  return (
    <div className="expenses-day">
      <div className="expenses-day__header">
        <button
          className="expenses-day__refresh"
          onClick={() => onRefresh(day)}
        >
          <Refresh />
        </button>

        {moment(day.date).format('LL')}

        {allowCollapse && (
          <button
            className="expenses-day__collapse"
            onClick={() => onCollapse(day)}
          >
            <CollapseIcon />
          </button>
        )}
      </div>

      <div className="expenses-day__content">
        {!isCollapsed &&
          day.expenses.map(expense => (
            <ExpenseView
              key={expense.id}
              expense={expense}
              moneyFormatter={moneyFormatter}
              dateFormatter={timeOnlyFormatter}
              onEdit={onEdit}
              onDelete={onDelete}
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

type ExpensesListProps = {
  expenses: DayExpenses[];
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
    const expenses = this.props.expenses;
    const allowDayCollapse = expenses.length > 1;
    return (
      <>
        {expenses.map(dayExpenses => (
          <DayExpenses
            key={dayExpenses.id}
            day={dayExpenses}
            allowCollapse={allowDayCollapse}
            collapsed={this.state.collapsedDays.includes(dayExpenses.id)}
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

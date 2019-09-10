import React from 'react';
import moment from 'moment';
import cn from 'classnames';
import DayPicker from 'react-daypicker';
import 'react-daypicker/lib/DayPicker.css';

import { MoneyPad } from 'app/views/components/MoneyPad';
import { StoreProps } from 'app/stores/AppStore';
import { ChevronLeft, UploadIcon } from '../components/MoneyPad/icons';
import { Expense } from 'app/models/Expense';
import { capitalize } from 'app/utils/string';

type CreateExpenseViewProps = {
  date?: Date;
  amount?: number;
  description?: string;
  category?: string;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
};

type CreateExpenseViewState = {
  date: Date;
  showPicker: Boolean;
};

export class CreateExpenseView extends React.PureComponent<
  CreateExpenseViewProps & StoreProps,
  CreateExpenseViewState
> {
  private moneypad = React.createRef<MoneyPad>();

  constructor(props: CreateExpenseViewProps) {
    super(props);
    this.state = {
      date: props.date || new Date(),
      showPicker: false
    };
  }

  createExpense(expense?: Expense) {
    const moneypad = this.moneypad.current;
    if (!moneypad) {
      return;
    }

    expense = moneypad.createExpense(expense);
    expense.date = new Date(this.state.date);
    return expense;
  }

  showDatePicker = () => {
    this.setState({ showPicker: true });
  };

  hideDatePicker = () => {
    this.setState({ showPicker: false });
  };

  // -----------------------
  // Handlers
  // -----------------------
  onDateCancel = () => {
    this.setState({ date: this.props.date || new Date(), showPicker: false });
  };

  onDatePicked = (date: Date) => {
    if (!moment(date).isAfter(moment())) {
      const oldDate = this.props.date || new Date();
      const newDate = moment(date)
        .set({
          h: oldDate.getHours(),
          m: oldDate.getMinutes(),
          s: oldDate.getSeconds()
        })
        .toDate();
      console.log(date, newDate);
      this.setState({ date: newDate });
    }
  };

  onCreate = () => {
    const expense = this.createExpense();
    const { onSave } = this.props;
    if (typeof onSave === 'function') {
      onSave(expense);
    }
  };

  // -----------------------
  // Render
  // -----------------------
  render() {
    const isShowingPicker = this.state.showPicker;
    return (
      <div className="screen-view">
        {isShowingPicker ? (
          <div className="navigation-bar">
            <button
              className="navigation-bar__button"
              onClick={this.onDateCancel}
            >
              Anuluj
            </button>
            <button
              className="navigation-bar--lg navigation-bar--bold"
              onClick={this.hideDatePicker}
            >
              {moment(this.state.date).format('LL')}
            </button>
            <button
              className="navigation-bar__button navigation-bar__button--reverse"
              onClick={this.hideDatePicker}
            >
              OK
            </button>
          </div>
        ) : (
          <div className="navigation-bar">
            <button
              className="navigation-bar__button"
              onClick={() => this.props.onCancel()}
            >
              <ChevronLeft /> Anuluj
            </button>
            <button
              className="navigation-bar--lg"
              onClick={this.showDatePicker}
            >
              {moment(this.state.date).format('LL')}
            </button>
            <button
              className="navigation-bar__button navigation-bar__button--reverse"
              onClick={this.onCreate}
            >
              <UploadIcon /> Dodaj
            </button>
          </div>
        )}

        <div className="expense-create">
          {isShowingPicker && (
            <div className="expense-create__date">
              <DayPicker
                //@ts-ignore
                monthNames={moment.months(true).map(month => capitalize(month))}
                longDayNames={moment.weekdays()}
                shortDayNames={moment.weekdaysShort()}
                onDayClick={this.onDatePicked}
              />
            </div>
          )}
          <div
            className={cn('expense-create__input', {
              ['expense-create__input--disabled']: isShowingPicker
            })}
          >
            <div className="expense-create__cover"></div>
            <MoneyPad
              ref={this.moneypad}
              amount={this.props.amount}
              description={this.props.description}
              category={this.props.category}
              onCreate={this.onCreate}
            />
          </div>
        </div>
      </div>
    );
  }
}

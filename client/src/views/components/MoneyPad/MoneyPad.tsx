// Core
import React from 'react';
import accounting from 'accounting';
import Money from 'cents';
import DeviceDetection from 'app/utils/DeviceDetection';

import { CategoryList } from './CategoryList';
import { DeleteIcon, UploadIcon } from './icons';
import { Categories } from 'app/data';
import { Expense } from 'app/models/Expense';

accounting.settings = {
  currency: {
    symbol: 'zł', // default currency symbol is '$'
    format: '%v %s', // controls output: %s = symbol, %v = amount/number (can be object: see below)
    decimal: '.', // decimal point separator
    thousand: ' ', // thousands separator
    precision: 2 // decimal places
  },
  number: {
    precision: 0, // default precision on numbers is 0
    thousand: ' ',
    decimal: '.'
  }
};

const toCurrency = (amount: number) =>
  accounting.formatMoney(Money.cents(amount).toFixed(), { format: '%v' });

type MoneyInputProps = {
  amount?: number;
  description?: string;
  category?: string;
  onCreate: () => void;
};

type MoneyInputState = {
  amount: number;
  description: string;
  category: string;
};

export class MoneyPad extends React.Component<
  MoneyInputProps,
  MoneyInputState
> {
  state = {
    amount: 0,
    description: '',
    category: ''
  };

  categoriesRef = React.createRef<HTMLDivElement>();

  constructor(props: MoneyInputProps) {
    super(props);
    this.state = {
      amount: props.amount || 0,
      description: props.description || '',
      category: props.category || ''
    };
  }

  appendDigit(digit: string) {
    const newAmount = (this.state.amount || 0).toString() + digit;
    this.setState({ amount: parseInt(newAmount) });
  }

  createExpense(expenses?: Expense): Expense {
    const { amount, category, description } = this.state;
    const newExpense = expenses || new Expense();
    newExpense.amount = Money.cents(amount);
    newExpense.category = category;
    newExpense.description = description;
    return newExpense;
  }

  // -----------------------
  // Handlers
  // -----------------------
  onNumberClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const digit = (evt.target as HTMLElement).innerText;
    this.appendDigit(digit);
  };

  onDeleteClick = () => {
    const { amount } = this.state;
    const amountStr = amount.toString();
    const newAmount = amountStr
      ? amountStr.substring(0, amountStr.length - 1) || '0'
      : '0';
    this.setState({ amount: parseInt(newAmount) });
  };

  onCreateClick = () => {
    const { onCreate } = this.props;
    if (typeof onCreate === 'function') {
      onCreate();
    }

    this.setState({ amount: 0, description: '', category: '' });
  };

  onDescriptionChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: evt.target.value });
  };

  preventTouchEvents = (evt: Event) => {
    const target = event.target as HTMLElement;
    const categoriesEl = this.categoriesRef.current;

    if (
      target &&
      categoriesEl &&
      (target === categoriesEl || categoriesEl.contains(target))
    ) {
      return;
    }

    event.preventDefault();
  };

  onKeyDown = (evt: KeyboardEvent) => {
    const activeElTagName =
      document.activeElement && document.activeElement.tagName;
    if (['INPUT', 'TEXTAREA'].includes(activeElTagName)) {
      return;
    }

    const key = evt.key;
    if ('0123456789'.split('').includes(key)) {
      this.appendDigit(key);
    } else if (['Delete', 'Backspace'].includes(key)) {
      this.onDeleteClick();
    }

    evt.preventDefault();
  };

  // -----------------------
  // Lifecycle
  // -----------------------

  componentDidMount() {
    if (DeviceDetection.isMobile) {
      document.addEventListener('touchmove', this.preventTouchEvents, {
        passive: false
      });
    }
    document.addEventListener('keydown', this.onKeyDown, true);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown, true);
    if (DeviceDetection.isMobile) {
      document.removeEventListener('touchmove', this.preventTouchEvents);
    }
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    return (
      <div className="moneyInput">
        <div className="moneypad__display">
          <span className="moneypad__value">
            {toCurrency(this.state.amount)}
          </span>
          <small>zł</small>
        </div>

        <div className="moneypad__categories" ref={this.categoriesRef}>
          <CategoryList
            categories={Categories}
            category={this.state.category}
            onSelect={category => this.setState({ category })}
          />
        </div>

        <div className="moneypad__description">
          <input
            placeholder="Opis"
            value={this.state.description}
            onChange={this.onDescriptionChange}
          />
        </div>

        <div className="moneypad__keypad">
          <div className="row">
            <button onClick={this.onNumberClick}>1</button>
            <button onClick={this.onNumberClick}>2</button>
            <button onClick={this.onNumberClick}>3</button>
          </div>
          <div className="row">
            <button onClick={this.onNumberClick}>4</button>
            <button onClick={this.onNumberClick}>5</button>
            <button onClick={this.onNumberClick}>6</button>
          </div>
          <div className="row">
            <button onClick={this.onNumberClick}>7</button>
            <button onClick={this.onNumberClick}>8</button>
            <button onClick={this.onNumberClick}>9</button>
          </div>
          <div className="row">
            <button onClick={this.onCreateClick}>
              <UploadIcon strokeWidth={2} />
            </button>
            <button onClick={this.onNumberClick}>0</button>
            <button onClick={this.onDeleteClick}>
              <DeleteIcon />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

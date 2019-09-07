import moment from 'moment';
import Money from 'cents';
import { ExpenseType } from 'app/gql/queries';

const DefaultIdPrefix = '_new:';

export const enum ExpenseState {
  ready = 0,
  created = 1,
  edited = 2,
  deleted = 3
}

export type ExpenseJSON = {
  i: string;
  u: string;
  a: number;
  t: number;
  d?: string;
  c?: string;
};

export class Expense {
  id: string;
  user: string;
  amount: Money;
  date: Date;
  description: string;
  category: string;

  $state = ExpenseState.ready;

  constructor() {
    this.id = `${DefaultIdPrefix}${Date.now()}`;
  }

  get synchronized() {
    return this.$state == ExpenseState.ready;
  }

  getState() {
    return this.$state;
  }

  setState(state: ExpenseState) {
    this.$state = state;
  }

  static fromGQL(item: ExpenseType): Expense {
    const expense = new Expense();
    expense.id = item.id;
    expense.user = item.user;
    expense.amount = Money.cents(item.amount);
    expense.date = moment.unix(item.date).toDate();
    expense.description = item.description;
    expense.category =
      item.categories && item.categories.length ? item.categories[0] : '';
    return expense;
  }

  clone() {
    const expense = new Expense();
    expense.id = this.id;
    expense.user = this.user;
    expense.amount = this.amount.clone();
    expense.date = moment(this.date).toDate();
    expense.description = this.description;
    expense.category = this.category;
    return expense;
  }

  toVars(includeId: Boolean = false): any {
    const vars: any = {
      user: this.user,
      amount: this.amount.cents
    };

    if (this.date) {
      vars.date = moment(this.date).unix();
    }

    if (this.description) {
      vars.description = this.description;
    }

    if (this.category) {
      vars.category = [this.category];
    }

    if (includeId && this.id) {
      vars.id = this.id;
    }

    return vars;
  }

  serialize(): ExpenseJSON {
    const data: any = {
      i: this.id,
      u: this.user,
      a: this.amount.cents,
      t: moment(this.date).unix()
    };

    if (this.description) {
      data.d = this.description;
    }

    if (this.category) {
      data.c = this.category;
    }
    return data;
  }

  static deserialize(data: ExpenseJSON): Expense | null;
  static deserialize(data: { [key: string]: any }): Expense | null;
  static deserialize(data: any): Expense | null {
    const requiredFields = ['i', 'u', 'a', 't'];
    if (!requiredFields.every(key => data[key] != undefined)) {
      return null;
    }
    const expense = new Expense();
    expense.id = data.i;
    expense.user = data.u;
    expense.amount = Money.cents(data.a);
    expense.date = moment.unix(data.t).toDate();
    expense.description = data.d;
    expense.category = data.c;
    return expense;
  }
}

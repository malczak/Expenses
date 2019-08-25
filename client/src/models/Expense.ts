import moment from 'moment';
import Money from 'cents';
import { ExpenseType } from 'app/gql/queries';

const DefaultIdPrefix = '_new:';

export class Expense {
  id: string;
  user: string;
  amount: Money;
  date: Date;
  description: string;
  category: string;

  constructor() {
    this.id = `${DefaultIdPrefix}${Date.now()}`;
  }

  get synchronized() {
    return this.id.indexOf(DefaultIdPrefix) != 0;
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
    expense.user = this.user;
    expense.amount = this.amount.clone();
    expense.date = moment(this.date).toDate();
    expense.description = this.description;
    expense.category = this.category;
    return expense;
  }

  serialize() {
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

  static deserialize(data: { [key: string]: any }): Expense | null {
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

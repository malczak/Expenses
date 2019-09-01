import moment from 'moment';
import { action, observable, reaction } from 'mobx';
import { User } from 'app/models/User';
import { Expense } from 'app/models/Expense';
import { Users } from 'app/data';
import sleep from 'app/utils/sleep';
import Client from 'app/gql/Client';
import {
  GetTodaysExpenses,
  ExpenseType,
  CreateExpense,
  GetExpensesInRange
} from 'app/gql/queries';
import { Loadable } from 'app/utils/Loadable';
import {
  TimePeriod,
  timePeriodsAreEqual,
  createDayPeriod,
  createPeriod,
  createTodayPeriod,
  createThisWeekPeriod
} from 'app/utils/Time';

const LCUserKey = '$user';
const LCPendingExpensesKey = '$pending';

export class AppStore {
  private client: Client;

  @observable.ref
  user?: User = null;

  @observable.ref
  period: TimePeriod = null;

  @observable.ref
  expenses: Loadable<Expense[]> = Loadable.empty();

  processingPending = false;

  constructor() {
    const version = (process.env.version as any) || {};
    console.warn(
      `**\nVersion ${version.GIT_BRANCH} #${version.GIT_COMMIT} @ ${version.BUILD_DATE} \n**`
    );

    const server = (process.env.config as any).server;
    this.client = new Client({
      endpoint: server.endpoint,
      credentials: server.credentials
    });

    reaction(
      () => this.user,
      () => {
        this.resetStore();
        this.rememberUser();
        this.fetchTodaysExpenses();
      }
    );

    this.loadUser();
  }

  // -----------------------
  // Actions
  // -----------------------

  @action
  setUser(user?: User) {
    this.user = user;
  }

  @action
  setPeriod(period: TimePeriod) {
    if (timePeriodsAreEqual(this.period, period)) {
      return;
    }
    this.period = period;
    this.setExpenses(undefined);
  }

  @action
  addExpense(expense: Expense) {
    if (!this.expenses.isAvailable) {
      throw new Error('Unable to add expense');
    }

    expense.user = this.user.name;

    const data = this.expenses.value;
    data.unshift(expense);
    this.setExpenses(Loadable.available(data));

    this.pushToPending(expense);
  }

  @action
  replaceExpense(id: string, update: Expense) {
    if (!this.expenses.isAvailable) {
      throw new Error('Unable to add expense');
    }
    const data = this.expenses.value;

    const index = data.findIndex(expense => expense.id === id);
    if (index == -1) {
      return;
    }

    const newData = data.map(expense => (expense.id === id ? update : expense));

    this.setExpenses(Loadable.available(newData));
  }

  @action
  setExpenses(expenses?: Loadable<Expense[]>) {
    expenses = expenses || Loadable.empty();
    if (expenses.isAvailable) {
      const data = expenses.value;
      this.expenses = Loadable.available(
        data.sort((e1, e2) => (e1.date < e2.date ? 1 : -1))
      );
    } else {
      this.expenses = expenses;
    }
  }

  // -----------------------
  // Methods
  // -----------------------
  loadUser() {
    const lc = window.localStorage;
    const data = lc.getItem(LCUserKey);
    if (!data) {
      return;
    }

    try {
      const { n, t } = JSON.parse(data);
      if (
        moment
          .unix(t)
          .utc()
          .add(30, 'days')
          .isBefore(moment())
      ) {
        throw new Error('Token expired');
      }

      const user = Users.find(user => user.name == n);
      this.setUser(user);
    } catch (err) {
      lc.removeItem(LCUserKey);
    }
  }

  rememberUser() {
    const lc = window.localStorage;
    lc.removeItem(LCUserKey);
    if (this.user) {
      const info = {
        n: this.user.name,
        t: moment()
          .utc()
          .unix()
      };
      lc.setItem(LCUserKey, JSON.stringify(info));
    }
  }

  resetStore() {
    if (this.expenses) {
      //@ts-ignore
      this.setExpenses(Loadable.empty());
    }
  }

  async signIn(username: string, password: string): Promise<User> {
    if (!username || !password) {
      throw new Error('Missing username/password');
    }

    const user = await sleep(
      2000,
      Users.find(
        user =>
          user.name.toLowerCase() == username.toLowerCase() &&
          user.passwd == password
      )
    );

    if (!user) {
      throw new Error('Unauthorised');
    }

    this.setUser(user);

    return user;
  }

  // -----------------------
  // GQL
  // -----------------------
  createExpense(expense: Expense): Promise<Expense> {
    const vars: any = {
      user: expense.user,
      amount: expense.amount.cents
    };

    if (expense.date) {
      vars.date = moment(expense.date).unix();
    }

    if (expense.description) {
      vars.description = expense.description;
    }

    if (expense.category) {
      vars.category = [expense.category];
    }

    return this.client
      .mutate(CreateExpense, vars)
      .then((data: ExpenseType) => Expense.fromGQL(data));
  }

  fetchWeekExpenses() {
    this.fetchPeriodExpenses(createThisWeekPeriod());
  }

  fetchTodaysExpenses() {
    this.setPeriod(createTodayPeriod());
    this.toExpenses(this.client.query(GetTodaysExpenses));
  }

  fetchPeriodExpenses(period: TimePeriod) {
    this.setPeriod(period);
    this.toExpenses(
      this.client.query(GetExpensesInRange, {
        since: moment(period.begin).unix(),
        to: moment(period.end).unix()
      })
    );
  }

  // -----------------------
  // Pending expenses
  // -----------------------
  pushToPending(expense: Expense) {
    const pendingExpenses = this.loadPendingExpenses();

    if (pendingExpenses.findIndex(item => item.i === expense.id) != -1) {
      return;
    }

    pendingExpenses.push(expense.serialize());
    this.savePendingExpenses(pendingExpenses);
    this.sendPendingExpenses();
  }

  async sendPendingExpenses(): Promise<Expense> {
    if (this.processingPending) {
      return;
    }

    const pendingExpenses = this.loadPendingExpenses();
    if (!pendingExpenses.length) {
      return;
    }

    const expense = Expense.deserialize(pendingExpenses.shift());
    if (expense) {
      this.createExpense(expense).then(createdExpense => {
        this.replaceExpense(expense.id, createdExpense);
      });
    }
    this.savePendingExpenses(pendingExpenses);

    this.sendPendingExpenses();
  }

  loadPendingExpenses(): any[] {
    const ls = window.localStorage;
    const serializedArr = ls.getItem(LCPendingExpensesKey);
    return typeof serializedArr === 'string' ? JSON.parse(serializedArr) : [];
  }

  savePendingExpenses(expenses: any[]) {
    const ls = window.localStorage;
    if (expenses.length) {
      const serializedArr = JSON.stringify(
        expenses.sort((e1, e2) => (e1.t < e2.t ? 1 : -1))
      );
      ls.setItem(LCPendingExpensesKey, serializedArr);
    } else {
      ls.removeItem(LCPendingExpensesKey);
    }
  }

  // -----------------------
  // Utils
  // -----------------------
  private toExpenses(
    promise: Promise<null | ExpenseType[]>
  ): Promise<null | Expense[]> {
    this.setExpenses(Loadable.loading());
    return promise
      .then(expenses => expenses.map(item => Expense.fromGQL(item)))
      .then(expenses => {
        this.setExpenses(Loadable.available(expenses));
        return expenses;
      })
      .catch(error => {
        console.error(error);
        this.setExpenses(Loadable.error(error));
        throw error;
      });
  }
}

export type StoreProps = {
  appStore?: AppStore;
};

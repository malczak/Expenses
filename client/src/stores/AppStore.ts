import moment from 'moment';
import { action, observable, reaction } from 'mobx';
import { User } from 'app/models/User';
import { Expense, ExpenseJSON, ExpenseState } from 'app/models/Expense';
import { Users } from 'app/data';
import sleep from 'app/utils/sleep';
import Client from 'app/gql/Client';
import {
  GetTodaysExpenses,
  ExpenseType,
  CreateExpense,
  GetExpensesInRange,
  UpdateExpense,
  DeleteExpense
} from 'app/gql/queries';
import { Loadable } from 'app/utils/Loadable';
import {
  TimePeriod,
  timePeriodsAreEqual,
  createTodayPeriod,
  createThisWeekPeriod,
  createThisMonthPeriod
} from 'app/utils/Time';

const LCUserKey = '$user';
const LCPendingExpensesKey = '$pending';

type ExpenseOperation = {
  type: 'create' | 'update' | 'delete';
  time: number;
  expense: ExpenseJSON;
};

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
        this.$fetchTodaysExpenses().then(() => this.sendPendingExpenses());
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
  updateExpense(expense: Expense) {
    if (!this.expenses.isAvailable) {
      throw new Error('Expenses not available');
    }

    const data = this.expenses.value;
    const expenseIndex = data.findIndex(item => item.id === expense.id);

    if (expenseIndex == -1) {
      throw new Error('Missing expense to edit');
    }

    expense.setState(ExpenseState.edited);
    data[expenseIndex] = expense;
    this.setExpenses(Loadable.available(data));

    this.pushToPending(expense, 'update');
  }

  @action
  deleteExpense(expense: Expense) {
    if (!this.expenses.isAvailable) {
      throw new Error('Expenses not available');
    }

    const data = this.expenses.value;
    const expenseIndex = data.findIndex(item => item.id === expense.id);

    if (expenseIndex == -1) {
      throw new Error('Missing expense to edit');
    }

    const udpatedExpense = expense.clone();
    udpatedExpense.setState(ExpenseState.deleted);
    data[expenseIndex] = udpatedExpense;
    this.setExpenses(Loadable.available(data));

    this.pushToPending(udpatedExpense, 'delete');
  }

  @action
  addExpense(expense: Expense) {
    if (!this.expenses.isAvailable) {
      throw new Error('Expenses not available');
    }

    if (!expense.date) {
      expense.date = new Date();
    }

    if (!expense.user) {
      expense.user = this.user.name;
    }

    const data = this.expenses.value;

    expense.setState(ExpenseState.created);
    data.unshift(expense);
    this.setExpenses(Loadable.available(data));

    this.pushToPending(expense, 'create');
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
  removeExpense(id: String) {
    if (!this.expenses.isAvailable) {
      throw new Error('Unable to add expense');
    }
    const data = this.expenses.value;

    const newData = data.filter(expense => expense.id !== id);
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
  $createExpense(expense: Expense): Promise<Expense> {
    return this.client
      .mutate(CreateExpense, expense.toVars(false))
      .then((data: ExpenseType) => Expense.fromGQL(data));
  }

  $updateExpense(expense: Expense): Promise<Expense> {
    return this.client
      .mutate(UpdateExpense, expense.toVars(true))
      .then((data: ExpenseType) => Expense.fromGQL(data));
  }

  $deleteExpense(expense: Expense): Promise<Expense> {
    return this.client
      .mutate(DeleteExpense, { id: expense.id })
      .then((data: ExpenseType) => Expense.fromGQL(data));
  }

  $fetchMonthExpenses(): Promise<Expense[]> {
    return this.$fetchPeriodExpenses(createThisMonthPeriod());
  }

  $fetchWeekExpenses(): Promise<Expense[]> {
    return this.$fetchPeriodExpenses(createThisWeekPeriod());
  }

  $fetchTodaysExpenses(): Promise<Expense[]> {
    this.setPeriod(createTodayPeriod());
    return this.toExpenses(this.client.query(GetTodaysExpenses));
  }

  $fetchPeriodExpenses(period: TimePeriod): Promise<Expense[]> {
    this.setPeriod(period);
    return this.toExpenses(
      this.client.query(GetExpensesInRange, {
        since: moment(period.begin).unix(),
        to: moment(period.end).unix()
      })
    );
  }

  // -----------------------
  // Pending expenses
  // -----------------------
  pushToPending(
    expense: Expense,
    operationType: 'create' | 'update' | 'delete'
  ) {
    const pendingOperations = this.loadPendingExpenses();

    if (
      pendingOperations.findIndex(item => item.expense.i === expense.id) != -1
    ) {
      return;
    }

    const operation: ExpenseOperation = {
      type: operationType,
      time: Date.now(),
      expense: expense.serialize()
    };
    pendingOperations.push(operation);
    this.savePendingExpenses(pendingOperations);
    this.sendPendingExpenses();
  }

  async sendPendingExpenses(): Promise<Expense> {
    if (this.processingPending) {
      return;
    }

    const operations = this.loadPendingExpenses();
    if (!operations.length) {
      return;
    }

    const operation = operations.shift();
    const expense = Expense.deserialize(operation.expense);
    if (expense) {
      let action: Promise<void>;

      switch (operation.type) {
        case 'create':
          action = this.$createExpense(expense).then(createdExpense => {
            this.replaceExpense(expense.id, createdExpense);
          });
          break;
        case 'update':
          action = this.$updateExpense(expense).then(udpatedExpense => {
            this.replaceExpense(expense.id, udpatedExpense);
          });
          break;
        case 'delete':
          action = this.$deleteExpense(expense).then(deletedExpense => {
            this.removeExpense(expense.id);
          });
          break;
      }

      action.then(() => this.sendPendingExpenses());
    }
    this.savePendingExpenses(operations);
  }

  loadPendingExpenses(): ExpenseOperation[] {
    const ls = window.localStorage;
    const serializedArr = ls.getItem(LCPendingExpensesKey);
    return typeof serializedArr === 'string' ? JSON.parse(serializedArr) : [];
  }

  savePendingExpenses(operations: ExpenseOperation[]) {
    const ls = window.localStorage;
    if (operations.length) {
      const serializedArr = JSON.stringify(
        operations.sort((o1, o2) => (o1.time < o2.time ? 1 : -1))
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

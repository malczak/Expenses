export class LoadableProgress {
  value: number = 0.0;

  constructor(value?: number) {
    this.value = value;
  }

  static indeterminate() {
    return new LoadableProgress();
  }

  static value(value: number) {
    return new LoadableProgress(value);
  }
}

export const enum LoadableState {
  empty = 'empty',
  loading = 'loading',
  error = 'error',
  available = 'available'
}

export class Loadable<T> {
  state: LoadableState = LoadableState.empty;

  value: T = null;

  constructor(state: LoadableState);
  constructor(value: T, state: LoadableState);
  constructor(value: any, state?: any) {
    if (arguments.length == 2) {
      this.value = <T>value;
      this.state = <LoadableState>state;
    } else {
      this.state = <LoadableState>value;
    }
  }

  get isEmpty() {
    return this.state == LoadableState.empty;
  }

  get isLoading() {
    return this.state == LoadableState.loading;
  }

  get isReady() {
    return this.state == LoadableState.available;
  }

  get isAvailable() {
    return this.isReady;
  }

  get hasError() {
    return this.state == LoadableState.error;
  }

  get isInvalid() {
    return this.hasError;
  }

  static empty() {
    return new Loadable(null, LoadableState.empty);
  }

  static loading(progress: number) {
    return new Loadable(progress, LoadableState.loading);
  }

  static error(error: Error) {
    return new Loadable(error, LoadableState.error);
  }

  static available<T>(value: T) {
    return new Loadable(value, LoadableState.available);
  }
}

export default Loadable;

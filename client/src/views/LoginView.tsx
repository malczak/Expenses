import React from 'react';
import { observer, inject } from 'mobx-react';
import { StoreProps } from 'app/stores/AppStore';

type LoginViewProps = {};

type LoginViewState = {
  username: string;
  password: string;
  error: string | null;
  busy: boolean;
};

@inject('appStore')
@observer
export class LoginView extends React.Component<
  LoginViewProps & StoreProps,
  LoginViewState
> {
  state = { username: '', password: '', error: '', busy: false };

  usernameInputRef = React.createRef<HTMLInputElement>();

  passwordInputRef = React.createRef<HTMLInputElement>();

  hideErrorTid?: NodeJS.Timeout;

  isLoginButtonEnabled() {
    const { password, busy } = this.state;
    return password && password.length && !busy;
  }

  // -----------------------
  // Handlers
  // -----------------------
  onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key == 'Enter') {
      evt.preventDefault();
      const target = evt.target as HTMLInputElement;
      if (target == this.usernameInputRef.current) {
        this.passwordInputRef.current.focus();
      } else if (target == this.passwordInputRef.current) {
        if (this.isLoginButtonEnabled()) {
          this.onLoginClick();
        }
      }
    }
  };

  onLoginClick = () => {
    this.setState({ busy: true });
    this.props.appStore
      .signIn(this.state.username, this.state.password)
      .catch(() => {
        this.setError('Ups... 🚫');
        this.setState({ busy: false });
      });
  };

  setError(error: string) {
    if (this.hideErrorTid) {
      clearTimeout(this.hideErrorTid);
    }

    this.setState({ password: '', error }, () => {
      this.hideErrorTid = setTimeout(
        () => this.setState({ error: null }),
        2000 + 100 * error.length
      );
    });
  }

  // -----------------------
  // Lifecycle
  // -----------------------
  componentDidMount() {
    this.usernameInputRef.current.focus();
  }

  // -----------------------
  // Render
  // -----------------------
  render() {
    const { username, password, busy, error } = this.state;
    return (
      <div className="loginview">
        <p className="loginview__title">Wydatki</p>
        <input
          className="loginview__input"
          ref={this.usernameInputRef}
          placeholder="username"
          type="username"
          value={username}
          onChange={evt => this.setState({ username: evt.target.value })}
          onKeyDown={this.onKeyDown}
          {...(busy ? { disabled: true } : null)}
        />
        <input
          className="loginview__input"
          ref={this.passwordInputRef}
          placeholder="password"
          type="password"
          value={password}
          onChange={evt => this.setState({ password: evt.target.value })}
          onKeyDown={this.onKeyDown}
          {...(busy ? { disabled: true } : null)}
        />
        <button
          className="loginview__button"
          onClick={this.onLoginClick}
          {...(!this.isLoginButtonEnabled() ? { disabled: true } : null)}
        >
          Login
        </button>
        {error && (
          <div>
            <small>{error}</small>
          </div>
        )}
      </div>
    );
  }
}

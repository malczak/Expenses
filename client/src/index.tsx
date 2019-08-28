import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { AppContainer } from 'react-hot-loader';

import App from './App';

import './less/index.less';

declare let module: any;

configure({ enforceActions: 'observed', isolateGlobalState: true });

const render = (Component: React.ComponentClass) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => render(App));
}

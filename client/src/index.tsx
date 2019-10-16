import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import { AppContainer } from 'react-hot-loader';
import moment from 'moment';
import 'moment/locale/pl';

import App from './App';

import './less/index.less';

declare let module: any;

configure({ enforceActions: 'observed', isolateGlobalState: true });

moment.locale('pl');

// Register service worker
if ('serviceWorker' in navigator) {
  //   const sw_url = __webpack_public_path__ + process.env.SW_PATH;
  const sw_url = process.env.SW_PATH;
  navigator.serviceWorker.register(sw_url);
}

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

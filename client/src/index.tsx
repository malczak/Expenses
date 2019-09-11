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

const render = (Component: React.ComponentClass) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  );
};

// TODO: Skip due to cache issues
/*
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/worker.js')
    .then(function(reg) {})
    .catch(function(err) {});
}
*/

render(App);

if (module.hot) {
  module.hot.accept('./App', () => render(App));
}

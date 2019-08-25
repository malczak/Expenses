// Core
import React from 'react';

// Views
import MainView from 'app/views/MainView';
import { Provider } from 'mobx-react';
import { AppStore } from './stores/AppStore';

/**
 * Application container
 */
class App extends React.Component {
  render() {
    return (
      <Provider appStore={new AppStore()}>
        <MainView />
      </Provider>
    );
  }
}

export default App;

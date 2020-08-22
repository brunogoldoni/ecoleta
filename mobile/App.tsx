import React from 'react';
import {StatusBar} from 'react-native';

import Routes from './src/routes';

function App() {
  return (
    <>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <Routes />
    </>
  );
}

export default App;

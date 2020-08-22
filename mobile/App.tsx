import React from 'react';
import {StatusBar} from 'react-native';

import Home from './src/pages/Home';

function App() {
  return (
    <>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <Home />
    </>
  );
}

export default App;

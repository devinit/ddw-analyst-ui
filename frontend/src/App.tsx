import * as React from 'react';
import { render } from 'react-dom';
import * as localForage from 'localforage';
import { Routes } from './Routes';

import './styles/main.scss';

localForage.config({
  driver: localForage.LOCALSTORAGE,
  name: 'ddw-analyst-ui',
  storeName: 'ddw-store'
});

const wrapper = document.getElementById('app');
if (wrapper) {
    render(<Routes/>, wrapper);
}

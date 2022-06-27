import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as localForage from 'localforage';
import { Routes } from './Routes';
import 'core-js/stable';

import './styles/main.scss';

localForage.config({
  driver: localForage.LOCALSTORAGE,
  name: 'ddw-analyst-ui',
  storeName: 'ddw-store',
});

const wrapper = document.getElementById('app');
if (wrapper) {
  const root = createRoot(wrapper);
  root.render(<Routes />);
}

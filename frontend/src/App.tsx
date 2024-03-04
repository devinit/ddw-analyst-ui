import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as localForage from 'localforage';
import { Routes } from './Routes';
import 'core-js/stable';

import './styles/main.scss';
import axios from 'axios';

localForage.config({
  driver: localForage.LOCALSTORAGE,
  name: 'ddw-analyst-ui',
  storeName: 'ddw-store',
});

if (process.env.API_BASE_URL) {
  axios.defaults.baseURL = process.env.API_BASE_URL;
}

const wrapper = document.getElementById('app');
if (wrapper) {
  const root = createRoot(wrapper);
  root.render(<Routes />);
}

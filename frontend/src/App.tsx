import * as React from 'react';
import { render } from 'react-dom';
import { Routes } from './Routes';

import './styles/main.scss';

const wrapper = document.getElementById('app');
if (wrapper) {
    render(<Routes/>, wrapper);
}

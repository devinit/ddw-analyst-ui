import * as React from 'react';
import { render } from 'react-dom';

import '../styles/main.scss';

const App = () => <div>DDW Analyst Interface</div>;

const wrapper = document.getElementById('app');
if (wrapper) {
    render(<App />, wrapper);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRouter from './AppRouter';

const container = document.getElementById('root');

if (!container) {
    throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>
);

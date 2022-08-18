import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'
import theme from './theme/theme';
import { SessionProvider } from "@inrupt/solid-ui-react"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
<React.Fragment>
    <SessionProvider>
    <CssBaseline />
    <ThemeProvider theme={theme}>
    <App />
    </ThemeProvider>
    </SessionProvider>
</React.Fragment>
);





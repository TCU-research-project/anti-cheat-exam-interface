import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import store from "../store/index";
import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: `"Helvetica", "Arial"`,
  },
  palette: {
    primary: {
      main: '#388e3c',
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: '#E0C2FF',
      light: '#F5EBFF',
      // dark: will be calculated from palette.secondary.main,
      contrastText: '#47008F',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps?.session}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>Anti-Cheat Exam App</title>
            <meta name="author" content="TCU developer" />
          </Head>
          <Component {...pageProps} />
          <ToastContainer position="bottom-center" theme="light" />
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;

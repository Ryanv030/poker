import GlobalStyle from 'lib/styles/global';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle background="#fff" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props: { background: string }): string =>
      props.background}
  }
`;

export default GlobalStyle;

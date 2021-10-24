import Head from 'next/head';
import styled from 'styled-components';

const Header = styled.h1`
  color: blue;
`;

export default function Home() {
  return (
    <div>
      <Head>
        <title>Poker</title>
      </Head>
      <Header>sup</Header>
    </div>
  );
}

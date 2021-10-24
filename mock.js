const currentHand = {
  playersCards: ['5S', '6D'],
  communityCards: ['KH', 'TD', '2C', '3C', '4S'],
};

const cardMap = {
  A: 13,
  K: 12,
  Q: 11,
  J: 10,
  T: 9,
  9: 8,
  8: 7,
  7: 6,
  6: 5,
  5: 4,
  4: 3,
  3: 2,
  2: 1,
};

const pairCounter = {
  A: 0,
  K: 0,
  Q: 0,
  J: 0,
  T: 0,
  9: 0,
  8: 0,
  7: 0,
  6: 0,
  5: 0,
  4: 0,
  3: 0,
  2: 0,
};

const getKicker = (hand) => {
  return hand.playersCards.map((card) => {
    const c = card.split('')[0];
    return cardMap[c];
  });
};

const getHighCard = (hand) => {
  let highCard = 0;
  let highCardValue = 0;
  hand.forEach((card) => {
    const c = card.split('')[0];

    if (cardMap[c] > highCardValue) {
      highCard = card;
      highCardValue = cardMap[c];
    }
  });

  return highCard;
};

const getSortedHand = (hand) => {
  return [...hand].sort((a, b) => {
    const c1 = a.split('')[0];
    const c2 = b.split('')[0];
    return cardMap[c1] - cardMap[c2];
  });
};

const twoPair = (countedHand) => {
  // find if there are two cards  with 2 value
  // if there are then you need to find the value for the top pair
  let counter = 0;
  let topPairValue = 0;

  Object.entries(countedHand).forEach((c) => {
    if (c[1] === 2) {
      counter += 1;

      const pairValue = cardMap[c[0]] * 2;
      if (pairValue > topPairValue) {
        topPairValue = pairValue;
      }
    }
  });

  return { hasTwoPair: counter === 2, twoPairHandTotal: topPairValue };
};

const calcKinds = (hand) => {
  const cardCounter = { ...pairCounter };

  hand.forEach((card) => {
    const c = card.split('')[0];
    cardCounter[c] += 1;
  });

  const hasPairOrMore = !!Object.values(cardCounter).find((v) => v >= 2);

  if (!hasPairOrMore) return { hasKind: false };
  1;
  let handType = '';
  let handTotal = 0;

  Object.entries(cardCounter).forEach((c) => {
    if (c[1] === 4) {
      handType = 'four-kind';
      handTotal = cardMap[c[0]] * 4;

      return;
    }

    if (c[1] === 3) {
      handType = 'three-kind';
      handTotal = cardMap[c[0]] * 3;

      return;
    }

    if (c[1] === 2) {
      handType = 'pair';
      handTotal = cardMap[c[0]] * 2;

      return;
    }
  });

  const { hasTwoPair, twoPairHandTotal } = twoPair(cardCounter);

  if (handType === 'pair' && hasTwoPair) {
    handType = 'two-pair';
    handTotal = twoPairHandTotal;
  }

  console.log({ handType, handTotal });
  return { hasKind: true, handType, handTotal };

  // console.log({ handType, handTotal });
  /**
   * How should I hand this case?
   * Do I want to count pairs, two pairs, and trips in this function?
   *
   * If so what should I return?
   * {
   *  handType: 'pair' | 'two-pair' | 'three-kind' | 'four-kind'
   *  handTotal: number<add up the card totals to compare against other hands>
   *
   * }
   */
};

const calcStraight = (hand) => {
  let consecutiveCards = [];
  let lastCard = 0;

  hand.forEach((c, idx) => {
    const card = cardMap[c.split('')[0]];

    if (consecutiveCards.length === 5) return;

    if (card - lastCard === 1 || idx === 0) {
      consecutiveCards.push(c);
      lastCard = card;
    } else {
      consecutiveCards = [c];
      lastCard = card;
    }
  });

  let hasStraight = false;
  let handTotal = 0;

  if (consecutiveCards.length === 5) {
    hasStraight = true;
    handTotal = consecutiveCards.reduce((acc, card) => {
      acc += cardMap[card.split('')[0]];
      return acc;
    }, 0);
  }

  return { hasStraight, handTotal };
};

const determineResult = (h) => {
  const hand = [...h.playersCards, ...h.communityCards];
  const kicker = getKicker(h);

  const highCard = getHighCard(hand);
  const sortedHand = getSortedHand(hand);
  const { hasKind } = calcKinds(hand);
  const { hasStraight } = calcStraight(sortedHand);
  console.log({ kicker, highCard, hasKind, hasStraight });

  // return { result, kicker: highCard };
};

determineResult(currentHand);

const currentHand = {
  playersCards: ['3H', 'KH'],
  communityCards: ['AH', '4H', 'QH', 'TC', 'JS'],
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

const cardCounter = {
  A: [],
  K: [],
  Q: [],
  J: [],
  T: [],
  9: [],
  8: [],
  7: [],
  6: [],
  5: [],
  4: [],
  3: [],
  2: [],
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

const twoPair = (pairCounter) => {
  let counter = 0;
  let topPairValue = 0;
  let cards = [];

  Object.values(pairCounter).forEach((c) => {
    if (c.length === 2) {
      counter += 1;

      const pairValue = c.reduce((acc, cur) => {
        acc += cardMap[cur[0]];
        return acc;
      }, 0);

      if (pairValue > topPairValue) {
        topPairValue = pairValue;
      }

      cards.push(c);
    }
  });

  return { hasTwoPair: counter >= 2, twoPairHandTotal: topPairValue, cards };
};

const calcKinds = (hand) => {
  const pairCounter = { ...cardCounter };

  hand.forEach((card) => {
    const c = card.split('')[0];
    pairCounter[c].push(card);
  });

  const hasPairOrMore = !!Object.values(pairCounter).find((c) => c.length >= 2);

  if (!hasPairOrMore) return { hasKind: false };

  let kindType = '';
  let handTotal = 0;
  let cards = [];

  Object.values(pairCounter).forEach((c) => {
    if (kindType === 'four-kind') return;

    if (c.length === 4) {
      kindType = 'four-kind';
      handTotal = c.reduce((acc, cur) => {
        acc += cardMap[cur[0]];
        return acc;
      }, 0);
      cards = c;
      return;
    }

    if (c.length === 3) {
      kindType = 'three-kind';
      handTotal = c.reduce((acc, cur) => {
        acc += cardMap[cur[0]];
        return acc;
      }, 0);
      cards = c;
      return;
    }

    if (kindType === 'three-kind') return;

    if (c.length === 2) {
      kindType = 'pair';
      handTotal = c.reduce((acc, cur) => {
        acc += cardMap[cur[0]];
        return acc;
      }, 0);
      cards = c;
      return;
    }
  });

  if (kindType !== ('three-kind' || 'four-kind')) {
    const {
      hasTwoPair,
      twoPairHandTotal,
      cards: twoPairCards,
    } = twoPair(pairCounter);

    if (hasTwoPair) {
      kindType = 'two-pair';
      handTotal = twoPairHandTotal;
      cards = twoPairCards;
    }
  }

  return { hasKind: true, kindType, handTotal, cards, pairCounter };
};

const calcStraight = (hand) => {
  // do I need to dedupe this, yes I do  but then how do I handle the straight flush case?
  // I need to take aces as low cards into consideration for straights
  // console.log({ hand });
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
  let cards = [];

  if (consecutiveCards.length === 5) {
    hasStraight = true;
    handTotal = consecutiveCards.reduce((acc, card) => {
      cards.push(card);
      acc += cardMap[card.split('')[0]];
      return acc;
    }, 0);
  }

  return { hasStraight, handTotal, cards };
};

const calcFlush = (hand) => {
  const flushCounter = {
    H: [],
    C: [],
    D: [],
    S: [],
  };

  hand.forEach((c) => {
    const card = c.split('');
    flushCounter[card[1]].push(c);
  });

  let hasFlush = false;
  let handTotal = 0;
  let cards = [];

  for (const suit in flushCounter) {
    if (flushCounter[suit].length >= 5) {
      hasFlush = true;
      handTotal = flushCounter[suit].reduce((acc, card) => {
        const cardValue = cardMap[card.split('')[0]];

        cards.push(card);
        acc += cardValue;
        return acc;
      }, 0);
    }
  }

  return { hasFlush, handTotal, cards };
};

const calcFullHouse = (pairCounter, kindType, overCards) => {
  if (kindType !== 'three-kind') return { hasFullHouse: false };

  let underCards = [];
  Object.values(pairCounter).forEach((cardSet) => {
    if (cardSet.length === 2) {
      underCards = cardSet;
    }
  });

  const hasFullHouse = overCards.length === 3 && underCards.length === 2;

  let overCardsValue = 0;
  let underCardsValue = 0;

  if (hasFullHouse) {
    overCardsValue = overCards.reduce((acc, cur) => {
      acc += cardMap[cur[0]];
      return acc;
    }, 0);

    underCardsValue = underCards.reduce((acc, cur) => {
      acc += cardMap[cur[0]];
      return acc;
    }, 0);
  }
  return { hasFullHouse, overCardsValue, underCardsValue };
};

const calcStraightFlush = (hasStraight, straightCards) => {
  if (!hasStraight) return { hasStraightFlush: false, hasRoyalFlush: false };

  let counter = 0;
  let lastSuit = '';
  let royalCounter = 0;
  const royals = ['T', 'J', 'Q', 'K', 'A'];

  straightCards.forEach((card, idx) => {
    const splitCard = card.split('');
    const suit = splitCard[1];
    const c = splitCard[0];

    if (suit === lastSuit || idx === 0) {
      counter += 1;
    }

    if (royals.indexOf(c) !== -1) {
      royalCounter += 1;
    }

    lastSuit = suit;
  });

  const hasStraightFlush = counter === 5 && royalCounter !== 5;
  const hasRoyalFlush = counter === 5 && royalCounter === 5;

  return { hasStraightFlush, hasRoyalFlush };
};
const calcAlertnateStraight = (hand) => {
  console.log({ hand });
  hand.reduce(
    (acc, fullCard, idx) => {
      const splitCard = fullCard.split('');
      const card = splitCard[0];
      console.log(cardMap[card]);
      // console.log({ card, lastCard: cardMap[acc.lastCard] });
      // const cardDifference = cardMap[card] - cardMap[acc.lastCard];
      // console.log({ cardDifference });

      // ===================================
      if (card === acc.lastCard) {
        acc.cards.push(card);
      }

      if (cardMap[card] - cardMap[acc.lastCard]) acc.lastCard = card;
      return acc;
    },
    {
      lastCard: [],
      straightCounter: [],
      cards: [],
    }
  );
};

const determineResult = (h) => {
  console.time('start');
  const hand = [...h.playersCards, ...h.communityCards];
  const sortedHand = getSortedHand(hand);
  calcAlertnateStraight(sortedHand);
  const kicker = getKicker(h);
  const highCard = getHighCard(hand);
  const { hasKind, kindType, pairCounter, cards: cardsKind } = calcKinds(hand);
  const { hasStraight, cards: straightCards } = calcStraight(sortedHand);
  const { hasFlush } = calcFlush(hand);
  const { hasFullHouse } = calcFullHouse(pairCounter, kindType, cardsKind);
  const { hasStraightFlush, hasRoyalFlush } = calcStraightFlush(
    hasStraight,
    straightCards
  );

  // console.log({
  //   kicker,
  //   highCard,
  //   hasKind,
  //   kindType,
  //   hasStraight,
  //   hasFlush,
  //   hasFullHouse,
  //   hasStraightFlush,
  //   hasRoyalFlush,
  // });
  console.timeEnd('start');

  // straightFlush
  // royalFlush

  // edge case 6 or 7 suit
  // 6 or 7 straight
  // sort and slice the lowest
  // also I need to return the cards per check
  // make this edge case check in the determine result function
  // in fact I could just calculate the hand total based on the cards returned in the result function
  // if there are 6 cards returned then I need to recalculate the hand total

  // return { result, kicker: highCard };
};

determineResult(currentHand);

// Calculate this on the client then send the results through a websocket? Is that safe? Can it be spoofed? Could I hash it then unhash on the server?

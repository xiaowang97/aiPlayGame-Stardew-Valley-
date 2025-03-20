export type Suit = '♠' | '♥' | '♣' | '♦';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export const calculateCardValue = (rank: Rank): number => {
  if (rank === 'A') return 1;
  if (['J', 'Q', 'K', '10'].includes(rank)) return 0;
  return parseInt(rank);
};

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['♠', '♥', '♣', '♦'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: calculateCardValue(rank)
      });
    }
  }

  return deck;
}; 
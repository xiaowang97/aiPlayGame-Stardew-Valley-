import { Card, createDeck } from '../types/Card';

// 百家乐常量
export const DECK_COUNT = 8; // 标准赌场使用8副牌
export const CUT_CARD_POSITION = 16; // 当剩余牌数少于这个值时需要洗牌
export const MIN_CARDS_BEFORE_SHUFFLE = DECK_COUNT * 52 * 0.3; // 当使用了大约70%的牌后洗牌

// 游戏结果类型
export type GameResultType = '庄家赢！' | '闲家赢！' | '平局！' | '';

// 初始化并打乱多副牌
export const initializeDecks = (deckCount: number): Card[] => {
  let multipleDecks: Card[] = [];
  for (let i = 0; i < deckCount; i++) {
    multipleDecks = [...multipleDecks, ...createDeck()];
  }
  return shuffleDeck(multipleDecks);
};

// 打乱牌组
export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// 计算手牌总点数（百家乐规则：只计算个位数）
export const calculateHandTotal = (hand: Card[]): number => {
  return hand.reduce((total, card) => (total + card.value) % 10, 0);
};

// 闲家是否需要第三张牌
export const shouldPlayerDrawThirdCard = (playerTotal: number): boolean => {
  return playerTotal <= 5;
};

// 庄家是否需要第三张牌
export const shouldBankerDrawThirdCard = (
  bankerTotal: number,
  playerThirdCard?: Card
): boolean => {
  // 如果庄家点数为0-2，无论闲家第三张牌点数如何，都要牌
  if (bankerTotal <= 2) return true;
  
  // 如果庄家点数为7或以上，不要牌
  if (bankerTotal >= 7) return false;
  
  // 如果闲家没有拿第三张牌，庄家点数为0-5时要牌
  if (!playerThirdCard) return bankerTotal <= 5;
  
  // 根据闲家第三张牌的点数和庄家当前点数决定
  const playerThirdCardValue = playerThirdCard.value;
  
  if (bankerTotal === 3 && playerThirdCardValue !== 8) return true;
  if (bankerTotal === 4 && [2, 3, 4, 5, 6, 7].includes(playerThirdCardValue)) return true;
  if (bankerTotal === 5 && [4, 5, 6, 7].includes(playerThirdCardValue)) return true;
  if (bankerTotal === 6 && [6, 7].includes(playerThirdCardValue)) return true;
  
  return false;
};

// 确定赢家
export const determineWinner = (playerTotal: number, bankerTotal: number): GameResultType => {
  if (playerTotal === bankerTotal) {
    return '平局！';
  } else if (playerTotal > bankerTotal) {
    return '闲家赢！';
  } else {
    return '庄家赢！';
  }
}; 
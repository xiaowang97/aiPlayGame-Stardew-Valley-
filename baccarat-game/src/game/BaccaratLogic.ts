import { Card, createDeck } from '../types/Card';

// 百家乐常量
export const DECK_COUNT = 8; // 标准赌场使用8副牌
export const CUT_CARD_POSITION = 16; // 当剩余牌数少于这个值时需要洗牌
export const MIN_CARDS_BEFORE_SHUFFLE = DECK_COUNT * 52 * 0.3; // 当使用了大约70%的牌后洗牌

// 游戏结果类型
export type GameResultType = '庄家赢！' | '闲家赢！' | '平局！' | '';

// 熊猫系列玩法结果类型
export type PandaResultType = {
  isPanda: boolean;       // 普通熊猫：庄家6点赢
  isBigPanda: boolean;    // 大熊猫：庄家6点赢且3张牌
  isSmallPanda: boolean;  // 小熊猫：庄家6点赢且2张牌
  isPandaPair: boolean;   // 熊猫对子：庄家首两张牌为对子且以6点赢
  isPandaTie: boolean;    // 熊猫和：庄闲都是6点的平局
};

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

// 判断是否有配对（两张牌点数相同）
export const isPair = (cards: Card[]): boolean => {
  if (cards.length < 2) return false;
  return cards[0].rank === cards[1].rank;
};

// 判断熊猫系列结果
export const determinePandaResults = (
  result: GameResultType,
  bankerTotal: number,
  bankerHand: Card[],
  playerTotal?: number
): PandaResultType => {
  // 初始化结果
  const pandaResult: PandaResultType = {
    isPanda: false,
    isBigPanda: false,
    isSmallPanda: false,
    isPandaPair: false,
    isPandaTie: false
  };
  
  // 输出调试信息
  console.log('判断熊猫结果:', { result, bankerTotal, playerTotal });
  
  // 熊猫和：庄闲都是6点的平局
  if (result === '平局！' && bankerTotal === 6 && playerTotal === 6) {
    console.log('触发熊猫和!');
    pandaResult.isPandaTie = true;
    return pandaResult;
  }
  
  // 只有庄家赢且点数为6时才可能触发其他熊猫
  if (result === '庄家赢！' && bankerTotal === 6) {
    pandaResult.isPanda = true;
    
    // 根据庄家牌数判断大小熊猫
    if (bankerHand.length === 3) {
      pandaResult.isBigPanda = true;
    } else if (bankerHand.length === 2) {
      pandaResult.isSmallPanda = true;
    }
    
    // 判断熊猫对子
    if (isPair(bankerHand)) {
      pandaResult.isPandaPair = true;
    }
  }
  
  return pandaResult;
}; 
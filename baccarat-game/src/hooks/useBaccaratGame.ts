import { useState } from 'react';
import { Card } from '../types/Card';
import {
  GameResultType,
  initializeDecks,
  calculateHandTotal,
  shouldPlayerDrawThirdCard,
  shouldBankerDrawThirdCard,
  determineWinner,
  MIN_CARDS_BEFORE_SHUFFLE,
  PandaResultType,
  determinePandaResults
} from '../game/BaccaratLogic';

// 游戏历史记录项
export interface GameHistoryItem {
  result: GameResultType;
  playerScore: number;
  bankerScore: number;
  pandaResults?: PandaResultType | null;
}

// 龙统计
export interface DragonStats {
  banker: number[]; // 庄家连赢记录
  player: number[]; // 闲家连赢记录
  tie: number[];    // 连续平局记录
  currentBanker: number; // 当前庄家连赢
  currentPlayer: number; // 当前闲家连赢
  currentTie: number;    // 当前连续平局
}

// 游戏状态
export interface BaccaratGameState {
  deck: Card[];
  playerHand: Card[];
  bankerHand: Card[];
  gameResult: GameResultType;
  isGameStarted: boolean;
  roundsPlayed: number;
  cardsUsed: number;
  selectedDecks: number;
  gameHistory: GameHistoryItem[];
  needToShuffle: boolean;
  dragonStats: DragonStats;
  pandaResults: PandaResultType | null;
}

export const useBaccaratGame = () => {
  const [state, setState] = useState<BaccaratGameState>({
    deck: [],
    playerHand: [],
    bankerHand: [],
    gameResult: '',
    isGameStarted: false,
    roundsPlayed: 0,
    cardsUsed: 0,
    selectedDecks: 8,
    gameHistory: [],
    needToShuffle: false,
    dragonStats: {
      banker: [],
      player: [],
      tie: [],
      currentBanker: 0,
      currentPlayer: 0,
      currentTie: 0
    },
    pandaResults: null
  });

  // 开始新游戏/新一轮
  const startNewGame = () => {
    // 如果游戏已经开始，重置当前局状态但不需要再次调用startNewGame
    if (state.isGameStarted) {
      setState(prev => ({
        ...prev,
        playerHand: [],
        bankerHand: [],
        gameResult: '',
        isGameStarted: false
      }));
      
      // 在状态重置的下一个事件循环中发牌
      setTimeout(() => dealInitialCards(), 0);
      return;
    }

    // 检查牌是否足够完成一局游戏（最多可能用6张牌）
    if (state.deck.length < 6) {
      setState(prev => ({ ...prev, needToShuffle: true }));
      alert('牌不够了，请点击"洗牌"按钮重新开始游戏！');
      return;
    }

    // 检查是否需要洗牌（达到预设阈值）
    if (state.deck.length <= MIN_CARDS_BEFORE_SHUFFLE) {
      setState(prev => ({ ...prev, needToShuffle: true }));
      alert('剩余牌数较少，请点击"洗牌"按钮以继续游戏！');
      return;
    }

    // 正常发牌开始游戏
    dealInitialCards();
  };

  // 发初始牌
  const dealInitialCards = () => {
    // 安全检查：确保有足够的牌进行发牌
    if (state.deck.length < 6) {
      setState(prev => ({ ...prev, needToShuffle: true }));
      // 不需要重复alert，startNewGame已经处理
      return;
    }

    const initialPlayerHand = [state.deck[0], state.deck[2]];
    const initialBankerHand = [state.deck[1], state.deck[3]];
    
    // 更新剩余牌和使用的牌数量
    const newDeck = state.deck.slice(4);
    const newCardsUsed = state.cardsUsed + 4;
    
    setState(prev => ({
      ...prev,
      deck: newDeck,
      cardsUsed: newCardsUsed,
      playerHand: initialPlayerHand,
      bankerHand: initialBankerHand,
      isGameStarted: true
    }));

    const playerTotal = calculateHandTotal(initialPlayerHand);
    const bankerTotal = calculateHandTotal(initialBankerHand);

    // 自然牌：如果任一方初始两张牌总点数为8或9，则游戏结束
    if (playerTotal >= 8 || bankerTotal >= 8) {
      const result = determineWinner(playerTotal, bankerTotal);
      finishGame(result, playerTotal, bankerTotal);
    } else {
      // 再次检查是否有足够的牌进行可能的补牌
      if (newDeck.length < 2) {
        // 如果牌不够补牌，直接比较现有的手牌
        setState(prev => ({ ...prev, needToShuffle: true }));
        const result = determineWinner(playerTotal, bankerTotal);
        finishGame(result, playerTotal, bankerTotal);
        return;
      }
      handleThirdCard(initialPlayerHand, initialBankerHand, newDeck, newCardsUsed);
    }
  };

  // 处理第三张牌规则
  const handleThirdCard = (playerCards: Card[], bankerCards: Card[], remainingDeck: Card[], usedCards: number) => {
    // 安全检查：确保有足够的牌进行补牌
    if (remainingDeck.length === 0) {
      setState(prev => ({ ...prev, needToShuffle: true }));
      const playerTotal = calculateHandTotal(playerCards);
      const bankerTotal = calculateHandTotal(bankerCards);
      const result = determineWinner(playerTotal, bankerTotal);
      finishGame(result, playerTotal, bankerTotal, playerCards, bankerCards);
      return;
    }

    let finalPlayerHand = [...playerCards];
    let finalBankerHand = [...bankerCards];
    let newDeck = [...remainingDeck];
    let newCardsUsed = usedCards;

    const playerTotal = calculateHandTotal(playerCards);
    const bankerTotal = calculateHandTotal(bankerCards);
    let playerThirdCard: Card | undefined;

    // 闲家规则：点数为0-5时，要牌；点数为6-7时，不要牌
    if (shouldPlayerDrawThirdCard(playerTotal)) {
      if (newDeck.length > 0) {
        playerThirdCard = newDeck[0];
        finalPlayerHand.push(playerThirdCard);
        newDeck = newDeck.slice(1);
        newCardsUsed++;
      } else {
        // 牌不够，直接比较现有手牌
        setState(prev => ({ ...prev, needToShuffle: true }));
        const result = determineWinner(playerTotal, bankerTotal);
        finishGame(result, playerTotal, bankerTotal, playerCards, bankerCards);
        return;
      }
    }

    // 庄家规则，取决于庄家点数和闲家第三张牌的点数（如果闲家拿了第三张）
    if (shouldBankerDrawThirdCard(bankerTotal, playerThirdCard)) {
      if (newDeck.length > 0) {
        finalBankerHand.push(newDeck[0]);
        newDeck = newDeck.slice(1);
        newCardsUsed++;
      } else {
        // 牌不够，使用现有结果
        setState(prev => ({ ...prev, needToShuffle: true }));
        const finalPlayerTotal = calculateHandTotal(finalPlayerHand);
        const finalBankerTotal = calculateHandTotal(finalBankerHand);
        const result = determineWinner(finalPlayerTotal, finalBankerTotal);
        finishGame(result, finalPlayerTotal, finalBankerTotal, finalPlayerHand, finalBankerHand);
        return;
      }
    }

    // 更新状态
    const finalPlayerTotal = calculateHandTotal(finalPlayerHand);
    const finalBankerTotal = calculateHandTotal(finalBankerHand);
    const result = determineWinner(finalPlayerTotal, finalBankerTotal);

    // 完成游戏
    finishGame(result, finalPlayerTotal, finalBankerTotal, finalPlayerHand, finalBankerHand, newDeck, newCardsUsed);
  };

  // 完成游戏并更新状态
  const finishGame = (
    result: GameResultType, 
    playerTotal: number, 
    bankerTotal: number,
    finalPlayerHand?: Card[],
    finalBankerHand?: Card[],
    newDeck?: Card[],
    newCardsUsed?: number
  ) => {
    console.log('游戏结果:', { result, playerTotal, bankerTotal });
    
    setState(prev => {
      // 更新龙统计
      const newDragonStats = updateDragonStats(result, prev.dragonStats);
      
      // 计算熊猫结果
      let pandaResults = null;
      if (finalBankerHand) {
        pandaResults = determinePandaResults(result, bankerTotal, finalBankerHand, playerTotal);
      } else if (result === '平局！' && bankerTotal === 6 && playerTotal === 6) {
        // 如果没有提供手牌但是结果是平局且双方都是6点，也要判断熊猫和
        pandaResults = {
          isPanda: false,
          isBigPanda: false,
          isSmallPanda: false,
          isPandaPair: false,
          isPandaTie: true
        };
      }
      
      const updates: Partial<BaccaratGameState> = {
        gameResult: result,
        roundsPlayed: prev.roundsPlayed + 1,
        gameHistory: [
          ...prev.gameHistory, 
          { 
            result, 
            playerScore: playerTotal, 
            bankerScore: bankerTotal,
            pandaResults
          }
        ],
        dragonStats: newDragonStats,
        pandaResults
      };
      
      // 如果提供了手牌和牌组更新，也进行更新
      if (finalPlayerHand) updates.playerHand = finalPlayerHand;
      if (finalBankerHand) updates.bankerHand = finalBankerHand;
      if (newDeck) {
        updates.deck = newDeck;
        
        // 检查是否需要洗牌
        if (newDeck.length <= MIN_CARDS_BEFORE_SHUFFLE) {
          updates.needToShuffle = true;
        }
      }
      if (newCardsUsed !== undefined) updates.cardsUsed = newCardsUsed;
      
      return { ...prev, ...updates };
    });
  };

  // 更新长龙统计
  const updateDragonStats = (result: GameResultType, currentStats: DragonStats): DragonStats => {
    const newStats = { ...currentStats };
    
    // 根据结果更新当前连续次数
    if (result === '庄家赢！') {
      newStats.currentBanker += 1;
      newStats.currentPlayer = 0;
      newStats.currentTie = 0;
      
      // 如果这是一个新的连续记录，则记录它
      if (newStats.currentBanker >= 2) {
        // 如果当前长龙长度超过已有记录，则更新
        if (newStats.banker.length === 0 || newStats.currentBanker > Math.max(...newStats.banker)) {
          newStats.banker.push(newStats.currentBanker);
        }
      }
    } 
    else if (result === '闲家赢！') {
      newStats.currentBanker = 0;
      newStats.currentPlayer += 1;
      newStats.currentTie = 0;
      
      if (newStats.currentPlayer >= 2) {
        if (newStats.player.length === 0 || newStats.currentPlayer > Math.max(...newStats.player)) {
          newStats.player.push(newStats.currentPlayer);
        }
      }
    } 
    else if (result === '平局！') {
      newStats.currentTie += 1;
      // 平局不会重置庄闲连赢计数
      
      if (newStats.currentTie >= 2) {
        if (newStats.tie.length === 0 || newStats.currentTie > Math.max(...newStats.tie)) {
          newStats.tie.push(newStats.currentTie);
        }
      }
    }
    
    // 保持记录不超过10个
    if (newStats.banker.length > 10) newStats.banker = newStats.banker.slice(-10);
    if (newStats.player.length > 10) newStats.player = newStats.player.slice(-10);
    if (newStats.tie.length > 10) newStats.tie = newStats.tie.slice(-10);
    
    return newStats;
  };

  // 重置当前游戏（保留牌组和历史记录）
  const resetGame = () => {
    setState(prev => ({
      ...prev,
      playerHand: [],
      bankerHand: [],
      gameResult: '',
      isGameStarted: false
    }));
  };

  // 完全重置游戏并洗牌
  const fullReset = () => {
    const newDeck = initializeDecks(state.selectedDecks);
    
    setState({
      deck: newDeck,
      playerHand: [],
      bankerHand: [],
      gameResult: '',
      isGameStarted: false,
      roundsPlayed: 0,
      cardsUsed: 0,
      selectedDecks: state.selectedDecks, // 保留牌组数量设置
      gameHistory: [],
      needToShuffle: false,
      dragonStats: {
        banker: [],
        player: [],
        tie: [],
        currentBanker: 0,
        currentPlayer: 0,
        currentTie: 0
      },
      pandaResults: null
    });
  };

  // 修改牌组数量
  const handleDeckCountChange = (deckCount: number) => {
    setState(prev => ({
      ...prev,
      selectedDecks: deckCount
    }));
  };

  return {
    ...state,
    startNewGame,
    resetGame,
    fullReset,
    handleDeckCountChange
  };
};

export default useBaccaratGame; 
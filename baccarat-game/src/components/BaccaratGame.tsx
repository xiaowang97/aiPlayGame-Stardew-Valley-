import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Card, createDeck } from '../types/Card';

// 百家乐常量
const DECK_COUNT = 8; // 标准赌场使用8副牌
const CUT_CARD_POSITION = 16; // 当剩余牌数少于这个值时需要洗牌
const MIN_CARDS_BEFORE_SHUFFLE = DECK_COUNT * 52 * 0.2; // 当使用了大约80%的牌后洗牌

const BaccaratGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<string>('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(0);
  const [cardsUsed, setCardsUsed] = useState<number>(0);
  const [selectedDecks, setSelectedDecks] = useState<number>(8);
  const [gameHistory, setGameHistory] = useState<{result: string; playerScore: number; bankerScore: number}[]>([]);
  const [needToShuffle, setNeedToShuffle] = useState<boolean>(false);

  // 初始化并打乱多副牌
  const initializeDecks = (deckCount: number): Card[] => {
    let multipleDecks: Card[] = [];
    for (let i = 0; i < deckCount; i++) {
      multipleDecks = [...multipleDecks, ...createDeck()];
    }
    return shuffleDeck(multipleDecks);
  };

  // 打乱牌组
  const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  // 计算手牌总点数（百家乐规则：只计算个位数）
  const calculateHandTotal = (hand: Card[]): number => {
    return hand.reduce((total, card) => (total + card.value) % 10, 0);
  };

  // 开始新游戏/新一轮
  const startNewGame = () => {
    if (deck.length === 0 || deck.length <= MIN_CARDS_BEFORE_SHUFFLE) {
      const newDeck = initializeDecks(selectedDecks);
      setDeck(newDeck);
      setCardsUsed(0);
      setNeedToShuffle(false);
    }
    dealInitialCards();
  };

  // 发初始牌
  const dealInitialCards = () => {
    if (deck.length < 4) {
      setNeedToShuffle(true);
      return;
    }

    const initialPlayerHand = [deck[0], deck[2]];
    const initialBankerHand = [deck[1], deck[3]];
    
    // 更新剩余牌和使用的牌数量
    const newDeck = deck.slice(4);
    const newCardsUsed = cardsUsed + 4;
    
    setDeck(newDeck);
    setCardsUsed(newCardsUsed);
    setPlayerHand(initialPlayerHand);
    setBankerHand(initialBankerHand);
    setIsGameStarted(true);

    const playerTotal = calculateHandTotal(initialPlayerHand);
    const bankerTotal = calculateHandTotal(initialBankerHand);

    // 自然牌：如果任一方初始两张牌总点数为8或9，则游戏结束
    if (playerTotal >= 8 || bankerTotal >= 8) {
      determineWinner(initialPlayerHand, initialBankerHand);
    } else {
      handleThirdCard(initialPlayerHand, initialBankerHand, newDeck, newCardsUsed);
    }
  };

  // 处理第三张牌规则
  const handleThirdCard = (playerCards: Card[], bankerCards: Card[], remainingDeck: Card[], usedCards: number) => {
    let finalPlayerHand = [...playerCards];
    let finalBankerHand = [...bankerCards];
    let newDeck = [...remainingDeck];
    let newCardsUsed = usedCards;

    const playerTotal = calculateHandTotal(playerCards);
    const bankerTotal = calculateHandTotal(bankerCards);
    let playerDrewThird = false;

    // 闲家规则：点数为0-5时，要牌；点数为6-7时，不要牌
    if (playerTotal <= 5) {
      if (newDeck.length > 0) {
        finalPlayerHand.push(newDeck[0]);
        newDeck = newDeck.slice(1);
        newCardsUsed++;
        playerDrewThird = true;
      } else {
        setNeedToShuffle(true);
        return;
      }
    }

    // 庄家规则，更加复杂，取决于庄家点数和闲家第三张牌的点数（如果闲家拿了第三张）
    if (playerDrewThird) {
      const playerThirdCardValue = finalPlayerHand[2].value;
      // 根据闲家第三张牌的点数决定庄家是否要牌
      const shouldBankerDraw = 
        (bankerTotal === 0 || bankerTotal === 1 || bankerTotal === 2) ||
        (bankerTotal === 3 && playerThirdCardValue !== 8) ||
        (bankerTotal === 4 && [2, 3, 4, 5, 6, 7].includes(playerThirdCardValue)) ||
        (bankerTotal === 5 && [4, 5, 6, 7].includes(playerThirdCardValue)) ||
        (bankerTotal === 6 && [6, 7].includes(playerThirdCardValue));
      
      if (shouldBankerDraw) {
        if (newDeck.length > 0) {
          finalBankerHand.push(newDeck[0]);
          newDeck = newDeck.slice(1);
          newCardsUsed++;
        } else {
          setNeedToShuffle(true);
          return;
        }
      }
    } else {
      // 如果闲家没有拿第三张牌，庄家点数为0-5时要牌
      if (bankerTotal <= 5) {
        if (newDeck.length > 0) {
          finalBankerHand.push(newDeck[0]);
          newDeck = newDeck.slice(1);
          newCardsUsed++;
        } else {
          setNeedToShuffle(true);
          return;
        }
      }
    }

    // 更新状态
    setPlayerHand(finalPlayerHand);
    setBankerHand(finalBankerHand);
    setDeck(newDeck);
    setCardsUsed(newCardsUsed);

    // 比较最终点数
    determineWinner(finalPlayerHand, finalBankerHand);
  };

  // 确定赢家
  const determineWinner = (playerCards: Card[], bankerCards: Card[]) => {
    const playerTotal = calculateHandTotal(playerCards);
    const bankerTotal = calculateHandTotal(bankerCards);
    let result = '';

    if (playerTotal === bankerTotal) {
      result = '平局！';
    } else if (playerTotal > bankerTotal) {
      result = '闲家赢！';
    } else {
      result = '庄家赢！';
    }

    setGameResult(result);
    setRoundsPlayed(prev => prev + 1);
    setGameHistory(prev => [
      ...prev, 
      { result, playerScore: playerTotal, bankerScore: bankerTotal }
    ]);
    
    // 检查是否需要洗牌
    if (deck.length <= MIN_CARDS_BEFORE_SHUFFLE) {
      setNeedToShuffle(true);
    }
  };

  // 重置当前一局
  const resetGame = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setGameResult('');
    setIsGameStarted(false);
  };

  // 完全重置游戏（包括历史记录和牌组）
  const fullReset = () => {
    setDeck(initializeDecks(selectedDecks));
    resetGame();
    setRoundsPlayed(0);
    setCardsUsed(0);
    setGameHistory([]);
    setNeedToShuffle(false);
  };

  // 处理选择牌副数的变化
  const handleDeckCountChange = (event: any) => {
    setSelectedDecks(event.target.value);
  };

  // 渲染单张牌
  const renderCard = (card: Card) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        m: 1,
        minWidth: 60,
        textAlign: 'center',
        color: ['♥', '♦'].includes(card.suit) ? 'red' : 'black',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}
    >
      <Typography variant="h6">{card.rank}</Typography>
      <Typography>{card.suit}</Typography>
    </Paper>
  );

  // 当需要洗牌时的提示
  useEffect(() => {
    if (needToShuffle) {
      alert('需要洗牌！牌不够了。');
    }
  }, [needToShuffle]);

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom align="center">
        百家乐
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>牌副数</InputLabel>
          <Select
            value={selectedDecks}
            label="牌副数"
            onChange={handleDeckCountChange}
            disabled={isGameStarted}
          >
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={8}>8</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={startNewGame}
          disabled={isGameStarted || needToShuffle}
          sx={{ mr: 2 }}
        >
          {roundsPlayed === 0 ? '开始游戏' : '下一局'}
        </Button>
        <Button
          variant="outlined"
          onClick={resetGame}
          disabled={!isGameStarted || needToShuffle}
          sx={{ mr: 2 }}
        >
          重置当前局
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={fullReset}
        >
          完全重置 & 洗牌
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom align="center">
            闲家
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {playerHand.map((card, index) => (
              <Box key={index}>{renderCard(card)}</Box>
            ))}
          </Box>
          {playerHand.length > 0 && (
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              点数：{calculateHandTotal(playerHand)}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom align="center">
            庄家
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {bankerHand.map((card, index) => (
              <Box key={index}>{renderCard(card)}</Box>
            ))}
          </Box>
          {bankerHand.length > 0 && (
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              点数：{calculateHandTotal(bankerHand)}
            </Typography>
          )}
        </Grid>
      </Grid>

      {gameResult && (
        <Typography variant="h4" align="center" sx={{ mt: 4, color: 'primary.main' }}>
          {gameResult}
        </Typography>
      )}

      <Box sx={{ mt: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          游戏统计
        </Typography>
        <Typography>已玩局数: {roundsPlayed}</Typography>
        <Typography>已使用牌数: {cardsUsed} / {selectedDecks * 52}</Typography>
        <Typography>剩余牌数: {deck.length}</Typography>
        {needToShuffle && (
          <Typography sx={{ color: 'error.main', fontWeight: 'bold', mt: 1 }}>
            需要洗牌！点击"完全重置 & 洗牌"按钮。
          </Typography>
        )}
      </Box>

      {gameHistory.length > 0 && (
        <Box sx={{ mt: 4, p: 2, border: '1px solid #ddd', borderRadius: 2, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            历史记录
          </Typography>
          {gameHistory.map((game, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>局 {index + 1}: </Typography>
              <Typography>闲家 {game.playerScore} - 庄家 {game.bankerScore}</Typography>
              <Typography sx={{ 
                fontWeight: 'bold', 
                color: game.result.includes('闲家') ? 'primary.main' : 
                       game.result.includes('庄家') ? 'secondary.main' : 'text.primary' 
              }}>
                {game.result}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BaccaratGame; 
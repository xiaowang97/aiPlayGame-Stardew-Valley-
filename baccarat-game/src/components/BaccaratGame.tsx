import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import { Card, createDeck } from '../types/Card';

const BaccaratGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [bankerHand, setBankerHand] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<string>('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const calculateHandTotal = (hand: Card[]): number => {
    return hand.reduce((total, card) => (total + card.value) % 10, 0);
  };

  const dealInitialCards = () => {
    const shuffledDeck = shuffleDeck(createDeck());
    const initialPlayerHand = [shuffledDeck[0], shuffledDeck[2]];
    const initialBankerHand = [shuffledDeck[1], shuffledDeck[3]];
    
    setDeck(shuffledDeck.slice(4));
    setPlayerHand(initialPlayerHand);
    setBankerHand(initialBankerHand);
    setIsGameStarted(true);

    const playerTotal = calculateHandTotal(initialPlayerHand);
    const bankerTotal = calculateHandTotal(initialBankerHand);

    if (playerTotal >= 8 || bankerTotal >= 8) {
      determineWinner(initialPlayerHand, initialBankerHand);
    } else {
      handleThirdCard(initialPlayerHand, initialBankerHand, shuffledDeck.slice(4));
    }
  };

  const handleThirdCard = (playerCards: Card[], bankerCards: Card[], remainingDeck: Card[]) => {
    let finalPlayerHand = [...playerCards];
    let finalBankerHand = [...bankerCards];
    let newDeck = [...remainingDeck];

    const playerTotal = calculateHandTotal(playerCards);
    const bankerTotal = calculateHandTotal(bankerCards);

    // Player's third card rule
    if (playerTotal <= 5) {
      finalPlayerHand.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }

    // Banker's third card rule
    if (bankerTotal <= 5) {
      finalBankerHand.push(newDeck[0]);
      newDeck = newDeck.slice(1);
    }

    setPlayerHand(finalPlayerHand);
    setBankerHand(finalBankerHand);
    setDeck(newDeck);

    determineWinner(finalPlayerHand, finalBankerHand);
  };

  const determineWinner = (playerCards: Card[], bankerCards: Card[]) => {
    const playerTotal = calculateHandTotal(playerCards);
    const bankerTotal = calculateHandTotal(bankerCards);

    if (playerTotal === bankerTotal) {
      setGameResult('平局！');
    } else if (playerTotal > bankerTotal) {
      setGameResult('闲家赢！');
    } else {
      setGameResult('庄家赢！');
    }
  };

  const resetGame = () => {
    setPlayerHand([]);
    setBankerHand([]);
    setGameResult('');
    setIsGameStarted(false);
  };

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

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h3" gutterBottom align="center">
        百家乐
      </Typography>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={dealInitialCards}
          disabled={isGameStarted}
          sx={{ mr: 2 }}
        >
          开始游戏
        </Button>
        <Button
          variant="outlined"
          onClick={resetGame}
          disabled={!isGameStarted}
        >
          重新开始
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
    </Box>
  );
};

export default BaccaratGame; 
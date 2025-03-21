import React, { useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import HandDisplay from './cards/HandDisplay';
import GameControls from './GameControls';
import RoadMaps from './roadmaps/RoadMaps';
import useBaccaratGame from '../hooks/useBaccaratGame';
import { initializeDecks } from '../game/BaccaratLogic';

const BaccaratGame: React.FC = () => {
  // 使用自定义Hook管理游戏状态
  const {
    deck,
    playerHand,
    bankerHand,
    gameResult,
    isGameStarted,
    roundsPlayed,
    cardsUsed,
    selectedDecks,
    gameHistory,
    needToShuffle,
    dragonStats,
    startNewGame,
    resetGame,
    fullReset,
    handleDeckCountChange
  } = useBaccaratGame();

  // 初始化游戏，组件挂载时创建牌组
  useEffect(() => {
    if (deck.length === 0) {
      fullReset();
    }
  }, []);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
        百家乐
      </Typography>

      <GameControls 
        onStartGame={startNewGame}
        onResetGame={resetGame}
        onFullReset={fullReset}
        onDeckCountChange={handleDeckCountChange}
        isGameStarted={isGameStarted}
        needToShuffle={needToShuffle}
        selectedDecks={selectedDecks}
        cardsUsed={cardsUsed}
        roundsPlayed={roundsPlayed}
        deckSize={deck.length}
      />

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <HandDisplay title="闲家" cards={playerHand} />
          </Grid>

          <Grid item xs={12} md={6}>
            <HandDisplay title="庄家" cards={bankerHand} />
          </Grid>
        </Grid>

        {gameResult && (
          <Typography variant="h4" align="center" sx={{ mt: 4, color: 'primary.main' }}>
            {gameResult}
          </Typography>
        )}
      </Paper>

      {/* 路牌系统 */}
      <RoadMaps gameHistory={gameHistory} />
    </Box>
  );
};

export default BaccaratGame; 
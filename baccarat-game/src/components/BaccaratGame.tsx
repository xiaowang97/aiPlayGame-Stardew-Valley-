import React, { useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import HandDisplay from './cards/HandDisplay';
import GameControls from './GameControls';
import RoadMaps from './roadmaps/RoadMaps';
import PandaResults from './PandaResults';
import useBaccaratGame from '../hooks/useBaccaratGame';

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
    pandaResults,
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
  }, [deck.length, fullReset]);

  return (
    <Box sx={{ p: 2, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2 }}>
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

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <HandDisplay title="闲家" cards={playerHand} />
          </Grid>

          <Grid item xs={12} md={6}>
            <HandDisplay title="庄家" cards={bankerHand} />
          </Grid>
        </Grid>

        {gameResult && (
          <Typography variant="h5" align="center" sx={{ mt: 2, color: 'primary.main' }}>
            {gameResult}
          </Typography>
        )}
        
        {/* Debug info */}
        {(gameResult === '平局！' && playerHand.length > 0 && bankerHand.length > 0) && (
          <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
            闲家点数: {playerHand.reduce((sum, card) => (sum + card.value) % 10, 0)}, 
            庄家点数: {bankerHand.reduce((sum, card) => (sum + card.value) % 10, 0)}
          </Typography>
        )}
        
        {/* 熊猫结果显示 */}
        <PandaResults pandaResults={pandaResults} />
      </Paper>

      {/* 路牌系统 */}
      <RoadMaps gameHistory={gameHistory} />
    </Box>
  );
};

export default BaccaratGame; 
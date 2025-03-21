import React, { useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import HandDisplay from './cards/HandDisplay';
import GameControls from './GameControls';
import RoadMaps from './roadmaps/RoadMaps';
import PandaResults from './PandaResults';
import BettingArea from './BettingArea';
import useBaccaratGame from '../hooks/useBaccaratGame';
import { BetType } from './BettingArea';

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
    balance,
    currentBets,
    startNewGame,
    resetGame,
    fullReset,
    handleDeckCountChange,
    updateBalance,
    updateBets
  } = useBaccaratGame();

  // 初始化游戏，组件挂载时创建牌组
  useEffect(() => {
    if (deck.length === 0) {
      fullReset();
    }
  }, [deck.length, fullReset]);

  // 处理投注更新
  const handleBetPlaced = useCallback((bets: Record<BetType, number>) => {
    updateBets(bets);
  }, [updateBets]);

  // 处理余额更新
  const handleBalanceChange = useCallback((newBalance: number) => {
    updateBalance(newBalance);
  }, [updateBalance]);

  // 处理游戏重置（结算后）
  const handleGameReset = useCallback(() => {
    // 清除游戏结果，重置游戏状态以准备下一轮
    resetGame();
  }, [resetGame]);

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
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

          <RoadMaps gameHistory={gameHistory} />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <BettingArea 
            balance={balance}
            onBalanceChange={handleBalanceChange}
            gameResult={gameResult}
            isGameStarted={isGameStarted}
            onBetPlaced={handleBetPlaced}
            onGameReset={handleGameReset}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BaccaratGame; 
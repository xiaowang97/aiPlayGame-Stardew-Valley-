import React from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface GameControlsProps {
  onStartGame: () => void;
  onResetGame: () => void;
  onFullReset: () => void;
  onDeckCountChange: (count: number) => void;
  isGameStarted: boolean;
  needToShuffle: boolean;
  selectedDecks: number;
  cardsUsed: number;
  roundsPlayed: number;
  deckSize: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  onStartGame,
  onResetGame,
  onFullReset,
  onDeckCountChange,
  isGameStarted,
  needToShuffle,
  selectedDecks,
  cardsUsed,
  roundsPlayed,
  deckSize
}) => {
  const handleDeckCountChange = (event: SelectChangeEvent<number>) => {
    onDeckCountChange(event.target.value as number);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onStartGame}
          disabled={isGameStarted || needToShuffle}
          sx={{ mr: 2 }}
        >
          发牌
        </Button>
        <Button
          variant="outlined"
          onClick={onResetGame}
          disabled={!isGameStarted}
          sx={{ mr: 2 }}
        >
          重置当前局
        </Button>
        <Button
          variant="contained"
          color={needToShuffle ? "warning" : "secondary"}
          onClick={onFullReset}
        >
          完全重置 & 洗牌
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ minWidth: 120, mr: 2 }}>
          <InputLabel>牌组数量</InputLabel>
          <Select
            value={selectedDecks}
            label="牌组数量"
            onChange={handleDeckCountChange}
            disabled={isGameStarted}
          >
            <MenuItem value={1}>1副</MenuItem>
            <MenuItem value={4}>4副</MenuItem>
            <MenuItem value={6}>6副</MenuItem>
            <MenuItem value={8}>8副</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ textAlign: 'center' }}>
          <Box component="span" sx={{ mr: 2 }}>已玩局数: {roundsPlayed}</Box>
          <Box component="span" sx={{ mr: 2 }}>已用牌数: {cardsUsed}</Box>
          <Box component="span">剩余牌数: {deckSize}</Box>
          {needToShuffle && (
            <Box component="span" sx={{ color: 'warning.main', ml: 2, fontWeight: 'bold' }}>
              需要洗牌!
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default GameControls; 
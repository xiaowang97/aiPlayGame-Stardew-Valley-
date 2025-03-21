import React from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Grid, Typography } from '@mui/material';

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
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={12} sm={7}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onStartGame}
              disabled={needToShuffle}
              size="small"
            >
              发牌
            </Button>
            <Button
              variant="contained"
              color={needToShuffle ? "warning" : "secondary"}
              onClick={onFullReset}
              size="small"
            >
              洗牌
            </Button>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <InputLabel>牌组数</InputLabel>
              <Select
                value={selectedDecks}
                label="牌组数"
                onChange={handleDeckCountChange}
                disabled={isGameStarted}
              >
                <MenuItem value={1}>1副</MenuItem>
                <MenuItem value={4}>4副</MenuItem>
                <MenuItem value={6}>6副</MenuItem>
                <MenuItem value={8}>8副</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={5}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>局数: {roundsPlayed}</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>已用: {cardsUsed}张</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>剩余: {deckSize}张</Typography>
            {needToShuffle && (
              <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                需要洗牌!
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameControls; 
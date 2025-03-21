import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Card } from '../../types/Card';

interface PlayingCardProps {
  card: Card;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 1,
        m: 0.5,
        minWidth: 45,
        textAlign: 'center',
        color: ['♥', '♦'].includes(card.suit) ? 'red' : 'black',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    >
      <Typography variant="subtitle1" sx={{ lineHeight: 1, fontWeight: 'bold' }}>{card.rank}</Typography>
      <Typography variant="body2" sx={{ lineHeight: 1 }}>{card.suit}</Typography>
    </Paper>
  );
};

export default PlayingCard; 
import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Card } from '../../types/Card';

interface PlayingCardProps {
  card: Card;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card }) => {
  return (
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
};

export default PlayingCard; 
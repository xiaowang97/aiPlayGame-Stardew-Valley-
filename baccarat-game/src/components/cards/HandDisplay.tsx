import React from 'react';
import { Box, Typography } from '@mui/material';
import { Card } from '../../types/Card';
import PlayingCard from './PlayingCard';
import { calculateHandTotal } from '../../game/BaccaratLogic';

interface HandDisplayProps {
  title: string;
  cards: Card[];
}

const HandDisplay: React.FC<HandDisplayProps> = ({ title, cards }) => {
  const total = calculateHandTotal(cards);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
        {cards.map((card, index) => (
          <PlayingCard key={index} card={card} />
        ))}
      </Box>
      {cards.length > 0 && (
        <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
          点数：{total}
        </Typography>
      )}
    </Box>
  );
};

export default HandDisplay; 
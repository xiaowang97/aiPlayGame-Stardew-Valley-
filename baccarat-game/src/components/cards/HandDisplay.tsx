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
    <>
      <Typography variant="h5" gutterBottom align="center">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {cards.map((card, index) => (
          <Box key={index}>
            <PlayingCard card={card} />
          </Box>
        ))}
      </Box>
      {cards.length > 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>
          点数：{total}
        </Typography>
      )}
    </>
  );
};

export default HandDisplay; 
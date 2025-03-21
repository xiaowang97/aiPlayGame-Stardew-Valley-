import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { PandaResultType } from '../game/BaccaratLogic';

interface PandaResultsProps {
  pandaResults: PandaResultType | null;
}

const PandaResults: React.FC<PandaResultsProps> = ({ pandaResults }) => {
  // 调试信息
  console.log('PandaResults组件接收到的数据:', pandaResults);
  
  if (!pandaResults) return null;
  
  // 检查是否有任何熊猫结果
  const hasAnyPandaResults = 
    pandaResults.isPanda || 
    pandaResults.isBigPanda || 
    pandaResults.isSmallPanda || 
    pandaResults.isPandaPair ||
    pandaResults.isPandaTie;
    
  console.log('是否存在熊猫结果:', hasAnyPandaResults);
    
  if (!hasAnyPandaResults) return null;

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#b71c1c' }}>
        熊猫系列结果
      </Typography>
      
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {pandaResults.isPanda && (
          <Chip 
            label="熊猫" 
            color="error" 
            variant="outlined" 
            sx={{ 
              fontWeight: 'bold',
              border: '1px solid #b71c1c',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        )}
        
        {pandaResults.isBigPanda && (
          <Chip 
            label="大熊猫" 
            color="error"
            sx={{ 
              bgcolor: '#b71c1c', 
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        )}
        
        {pandaResults.isSmallPanda && (
          <Chip 
            label="小熊猫" 
            color="error"
            variant="outlined"
            sx={{ 
              fontWeight: 'bold',
              border: '1px solid #b71c1c',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        )}
        
        {pandaResults.isPandaPair && (
          <Chip 
            label="熊猫对子" 
            color="secondary"
            sx={{ 
              bgcolor: '#7b1fa2', 
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        )}
        
        {pandaResults.isPandaTie && (
          <Chip 
            label="熊猫和" 
            color="info"
            sx={{ 
              bgcolor: '#0288d1', 
              color: 'white',
              fontWeight: 'bold',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        )}
      </Stack>
      
      <Box sx={{ mt: 1 }}>
        {pandaResults.isPanda && (
          <Typography variant="body2" color="text.secondary">
            熊猫: 庄家6点赢 (赔率 25:1)
          </Typography>
        )}
        
        {pandaResults.isBigPanda && (
          <Typography variant="body2" color="text.secondary">
            大熊猫: 庄家6点赢且3张牌 (赔率 40:1)
          </Typography>
        )}
        
        {pandaResults.isSmallPanda && (
          <Typography variant="body2" color="text.secondary">
            小熊猫: 庄家6点赢且2张牌 (赔率 30:1)
          </Typography>
        )}
        
        {pandaResults.isPandaPair && (
          <Typography variant="body2" color="text.secondary">
            熊猫对子: 庄家首两张牌为对子且以6点赢 (赔率 100:1)
          </Typography>
        )}
        
        {pandaResults.isPandaTie && (
          <Typography variant="body2" color="text.secondary">
            熊猫和: 庄闲都是6点的平局 (赔率 150:1)
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PandaResults; 
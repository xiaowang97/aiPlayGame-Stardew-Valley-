import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Chip,
  TextField, 
  Divider
} from '@mui/material';

// 投注选项类型定义
export type BetType = '闲家' | '庄家' | '平局' | '闲对子' | '庄对子' | '大熊猫' | '小熊猫' | '熊猫对子' | '熊猫和';

// 投注项目的赔率
const PAYOUT_RATES: Record<BetType, number> = {
  '闲家': 1,       // 1:1
  '庄家': 0.95,    // 1:0.95 (5%佣金)
  '平局': 8,       // 1:8
  '闲对子': 11,    // 1:11
  '庄对子': 11,    // 1:11
  '大熊猫': 30,    // 1:30
  '小熊猫': 20,    // 1:20
  '熊猫对子': 70,  // 1:70
  '熊猫和': 60     // 1:60
};

// 筹码面值
const CHIP_VALUES = [10, 50, 100, 500, 1000, 5000];

interface BettingAreaProps {
  balance: number;
  onBalanceChange: (newBalance: number) => void;
  gameResult: string;
  isGameStarted: boolean;
  onBetPlaced: (bets: Record<BetType, number>) => void;
  onGameReset?: () => void;
}

const BettingArea: React.FC<BettingAreaProps> = ({
  balance,
  onBalanceChange,
  gameResult,
  isGameStarted,
  onBetPlaced,
  onGameReset
}) => {
  // 当前选中的筹码
  const [selectedChip, setSelectedChip] = useState<number>(CHIP_VALUES[0]);
  
  // 各投注区域的投注金额
  const [bets, setBets] = useState<Record<BetType, number>>({
    '闲家': 0,
    '庄家': 0,
    '平局': 0,
    '闲对子': 0,
    '庄对子': 0,
    '大熊猫': 0,
    '小熊猫': 0,
    '熊猫对子': 0,
    '熊猫和': 0
  });

  // 总投注金额
  const totalBet = Object.values(bets).reduce((sum, bet) => sum + bet, 0);

  // 处理投注
  const handleBet = (betType: BetType) => {
    if (isGameStarted) return; // 游戏开始后不能投注
    if (balance < selectedChip) return; // 余额不足

    const newBets = {
      ...bets,
      [betType]: bets[betType] + selectedChip
    };
    
    setBets(newBets);
    onBalanceChange(balance - selectedChip);
    onBetPlaced(newBets);
  };

  // 处理清除所有投注
  const handleClearAllBets = () => {
    if (isGameStarted) return; // 游戏开始后不能清除

    // 返还投注金额
    onBalanceChange(balance + totalBet);
    
    // 清除所有投注
    const clearedBets: Record<BetType, number> = {
      '闲家': 0,
      '庄家': 0,
      '平局': 0,
      '闲对子': 0,
      '庄对子': 0,
      '大熊猫': 0,
      '小熊猫': 0,
      '熊猫对子': 0,
      '熊猫和': 0
    };
    
    setBets(clearedBets);
    onBetPlaced(clearedBets);
  };

  // 处理清除单个投注
  const handleClearBet = (betType: BetType) => {
    if (isGameStarted) return; // 游戏开始后不能清除

    // 返还投注金额
    onBalanceChange(balance + bets[betType]);
    
    // 清除特定投注
    const newBets = {
      ...bets,
      [betType]: 0
    };
    
    setBets(newBets);
    onBetPlaced(newBets);
  };

  // 处理结算
  const handleSettlement = () => {
    if (gameResult === '') return; // 没有结果不能结算
    
    let winnings = 0;
    
    // 根据游戏结果结算各个投注
    if (gameResult === '闲家赢！') {
      winnings += bets['闲家'] * (1 + PAYOUT_RATES['闲家']);
      // 可能的闲对子赢
      if (bets['闲对子'] > 0) {
        // 这里应该从游戏状态获取闲家是否有对子，暂时保留原样
      }
    } else if (gameResult === '庄家赢！') {
      winnings += bets['庄家'] * (1 + PAYOUT_RATES['庄家']);
      // 可能的庄对子和熊猫系列赢
      if (bets['庄对子'] > 0) {
        // 这里应该从游戏状态获取庄家是否有对子，暂时保留原样
      }
      // 熊猫系列投注，根据游戏状态判断是否中奖
      // 暂时保留原样
    } else if (gameResult === '平局！') {
      winnings += bets['平局'] * (1 + PAYOUT_RATES['平局']);
      // 平局时庄闲投注返还本金
      winnings += bets['闲家'] + bets['庄家'];
      
      // 熊猫和判断，暂时保留原样
    }
    
    // 更新余额并清除投注
    onBalanceChange(balance + winnings);
    
    // 创建一个清空的投注对象
    const clearedBets: Record<BetType, number> = {
      '闲家': 0,
      '庄家': 0,
      '平局': 0,
      '闲对子': 0,
      '庄对子': 0,
      '大熊猫': 0,
      '小熊猫': 0,
      '熊猫对子': 0,
      '熊猫和': 0
    };
    
    // 更新本地状态
    setBets(clearedBets);
    
    // 通知父组件清除投注
    onBetPlaced(clearedBets);
    
    // 调用游戏重置回调（如果提供了）
    if (onGameReset) {
      // 短暂延迟以确保结算处理完成后再重置游戏
      setTimeout(() => {
        onGameReset();
      }, 300);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h5" align="center" gutterBottom>
        投注区域
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          余额: ¥{balance.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          总投注: ¥{totalBet.toLocaleString()}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* 筹码选择 */}
      <Typography variant="body1" gutterBottom>
        选择筹码:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {CHIP_VALUES.map((value) => (
          <Chip
            key={value}
            label={`¥${value}`}
            color={selectedChip === value ? "primary" : "default"}
            onClick={() => setSelectedChip(value)}
            sx={{ 
              fontWeight: selectedChip === value ? 'bold' : 'normal',
              cursor: 'pointer' 
            }}
          />
        ))}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* 主要投注区域 */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['闲家'] > 0 ? 'info.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'info.50' }
            }}
            onClick={() => handleBet('闲家')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('闲家');
            }}
          >
            <Typography variant="body1">闲家</Typography>
            <Typography variant="caption" display="block">1:1</Typography>
            {bets['闲家'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['闲家']}`} 
                color="primary"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['平局'] > 0 ? 'success.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'success.50' }
            }}
            onClick={() => handleBet('平局')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('平局');
            }}
          >
            <Typography variant="body1">平局</Typography>
            <Typography variant="caption" display="block">1:8</Typography>
            {bets['平局'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['平局']}`} 
                color="success"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['庄家'] > 0 ? 'error.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'error.50' }
            }}
            onClick={() => handleBet('庄家')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('庄家');
            }}
          >
            <Typography variant="body1">庄家</Typography>
            <Typography variant="caption" display="block">1:0.95</Typography>
            {bets['庄家'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['庄家']}`} 
                color="error"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* 对子投注区域 */}
      <Typography variant="body2" gutterBottom>
        对子投注:
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['闲对子'] > 0 ? 'secondary.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'secondary.50' }
            }}
            onClick={() => handleBet('闲对子')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('闲对子');
            }}
          >
            <Typography variant="body2">闲对子</Typography>
            <Typography variant="caption" display="block">1:11</Typography>
            {bets['闲对子'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['闲对子']}`} 
                color="secondary" 
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['庄对子'] > 0 ? 'secondary.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'secondary.50' }
            }}
            onClick={() => handleBet('庄对子')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('庄对子');
            }}
          >
            <Typography variant="body2">庄对子</Typography>
            <Typography variant="caption" display="block">1:11</Typography>
            {bets['庄对子'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['庄对子']}`} 
                color="secondary"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* 熊猫系列投注 */}
      <Typography variant="body2" gutterBottom>
        熊猫系列:
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              height: '100%',
              bgcolor: bets['大熊猫'] > 0 ? 'warning.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'warning.50' }
            }}
            onClick={() => handleBet('大熊猫')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('大熊猫');
            }}
          >
            <Typography variant="body2">大熊猫</Typography>
            <Typography variant="caption" display="block">1:30</Typography>
            {bets['大熊猫'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['大熊猫']}`} 
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              height: '100%',
              bgcolor: bets['小熊猫'] > 0 ? 'warning.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'warning.50' }
            }}
            onClick={() => handleBet('小熊猫')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('小熊猫');
            }}
          >
            <Typography variant="body2">小熊猫</Typography>
            <Typography variant="caption" display="block">1:20</Typography>
            {bets['小熊猫'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['小熊猫']}`} 
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['熊猫对子'] > 0 ? 'warning.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'warning.50' }
            }}
            onClick={() => handleBet('熊猫对子')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('熊猫对子');
            }}
          >
            <Typography variant="body2">熊猫对子</Typography>
            <Typography variant="caption" display="block">1:70</Typography>
            {bets['熊猫对子'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['熊猫对子']}`} 
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              bgcolor: bets['熊猫和'] > 0 ? 'warning.light' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'warning.50' }
            }}
            onClick={() => handleBet('熊猫和')}
            onContextMenu={(e) => {
              e.preventDefault();
              handleClearBet('熊猫和');
            }}
          >
            <Typography variant="body2">熊猫和</Typography>
            <Typography variant="caption" display="block">1:60</Typography>
            {bets['熊猫和'] > 0 && (
              <Chip 
                size="small" 
                label={`¥${bets['熊猫和']}`} 
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Button 
          variant="outlined" 
          color="error" 
          disabled={totalBet === 0 || isGameStarted}
          onClick={handleClearAllBets}
        >
          清除投注
        </Button>
        
        <Button 
          variant="contained" 
          color="success"
          disabled={gameResult === ''}
          onClick={handleSettlement}
        >
          结算
        </Button>
      </Box>
      
      <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
        点击下注，右键清除单个投注
      </Typography>
    </Paper>
  );
};

export default BettingArea; 
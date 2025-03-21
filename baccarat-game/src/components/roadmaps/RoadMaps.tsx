import React from 'react';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography } from '@mui/material';
import { GameHistoryItem } from '../../hooks/useBaccaratGame';

interface RoadMapsProps {
  gameHistory: GameHistoryItem[];
}

const RoadMaps: React.FC<RoadMapsProps> = ({ gameHistory }) => {
  // 珠盘路 - 最基本的结果记录，按顺序排列
  const renderBeadPlate = () => {
    if (gameHistory.length === 0) return null;
    
    const rows = [];
    const cols = 8; // 每行显示8个结果，增加了显示密度
    
    for (let i = 0; i < Math.ceil(gameHistory.length / cols); i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        if (index < gameHistory.length) {
          const result = gameHistory[index].result;
          let color;
          if (result === '庄家赢！') color = 'red';
          else if (result === '闲家赢！') color = 'blue';
          else color = 'green'; // 平局
          
          row.push(
            <TableCell key={j} sx={{ p: 0.5, textAlign: 'center' }}>
              <Box 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  backgroundColor: color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  margin: '0 auto',
                  fontSize: '0.75rem'
                }}
              >
                {result === '庄家赢！' ? '庄' : result === '闲家赢！' ? '闲' : '和'}
              </Box>
            </TableCell>
          );
        } else {
          row.push(<TableCell key={j} sx={{ p: 0.5 }} />);
        }
      }
      rows.push(<TableRow key={i}>{row}</TableRow>);
    }
    
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>珠盘路</Typography>
        <TableContainer component={Paper} sx={{ mb: 1 }}>
          <Table size="small">
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // 大路 - 主要路单，庄闲交替式排列
  const renderBigRoad = () => {
    if (gameHistory.length === 0) return null;
    
    // 初始化用于大路的二维数组
    const matrix: (string | { type: string; ties: number })[][] = Array(6).fill(null).map(() => Array(20).fill(''));
    let currentCol = 0;
    let currentRow = 0;
    let lastResult: string | null = null;
    let lastPosition: { row: number; col: number } | null = null;
    
    // 填充大路矩阵
    gameHistory.forEach((item) => {
      const result = item.result;
      
      if (result === '平局！') {
        // 平局，在最后一个有效位置标记和局
        if (lastPosition !== null) {
          const { row, col } = lastPosition;
          const cell = matrix[row][col];
          
          if (typeof cell === 'string') {
            // 转换为对象格式
            matrix[row][col] = { 
              type: cell, 
              ties: 1 
            };
          } else if (cell && typeof cell === 'object') {
            // 已经是对象，增加和局计数
            cell.ties += 1;
          }
        }
      } else {
        // 庄或闲
        if (lastResult === null || result !== lastResult) {
          // 新的结果或结果变化，移至下一列
          currentCol++;
          currentRow = 0;
        } else {
          // 结果没变，在当前列向下移动
          currentRow++;
        }
        
        // 确保不超出矩阵边界
        if (currentCol >= matrix[0].length) {
          // 如果超出列限制，停止记录
          return;
        }
        
        if (currentRow >= matrix.length) {
          // 如果超出行限制，向右移动一列并从第一行开始
          currentCol++;
          currentRow = 0;
          
          // 再次检查列边界
          if (currentCol >= matrix[0].length) return;
        }
        
        // 记录结果
        matrix[currentRow][currentCol] = result === '庄家赢！' ? '庄' : '闲';
        lastResult = result;
        lastPosition = { row: currentRow, col: currentCol };
      }
    });
    
    // 渲染大路矩阵
    const rows = matrix.map((row, rowIndex) => (
      <TableRow key={rowIndex}>
        {row.map((cell, colIndex) => {
          if (!cell) return <TableCell key={colIndex} sx={{ p: 0.5, width: 30, height: 30 }}></TableCell>;
          
          const type = typeof cell === 'string' ? cell : cell.type;
          const tieCount = typeof cell === 'object' ? cell.ties : 0;
          const color = type === '庄' ? 'red' : 'blue';
          
          return (
            <TableCell key={colIndex} sx={{ p: 0.5, width: 30, height: 30 }}>
              <Box 
                sx={{ 
                  width: 28,
                  height: 28,
                  backgroundColor: color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: '0.75rem'
                }}
              >
                {type}
                {tieCount > 0 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      fontSize: '0.6rem',
                      bgcolor: 'green',
                      color: 'white',
                      width: 12,
                      height: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tieCount}
                  </Box>
                )}
              </Box>
            </TableCell>
          );
        })}
      </TableRow>
    ));
    
    return (
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>大路</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 0.5 }}>路牌系统</Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {renderBeadPlate()}
        </Grid>
        <Grid item xs={12}>
          {renderBigRoad()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoadMaps; 
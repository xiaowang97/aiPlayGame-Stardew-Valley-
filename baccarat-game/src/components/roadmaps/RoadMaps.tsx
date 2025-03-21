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
    const cols = 6; // 每行显示6个结果
    
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
            <TableCell key={j} sx={{ p: 1, textAlign: 'center' }}>
              <Box 
                sx={{ 
                  width: 30, 
                  height: 30, 
                  borderRadius: '50%', 
                  backgroundColor: color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  margin: '0 auto'
                }}
              >
                {result === '庄家赢！' ? '庄' : result === '闲家赢！' ? '闲' : '和'}
              </Box>
            </TableCell>
          );
        } else {
          row.push(<TableCell key={j} />);
        }
      }
      rows.push(<TableRow key={i}>{row}</TableRow>);
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>珠盘路</Typography>
        <TableContainer component={Paper}>
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
    const matrix: string[][] = Array(6).fill(null).map(() => Array(20).fill(''));
    let currentCol = 0;
    let currentRow = 0;
    let lastResult: string | null = null;
    
    // 填充大路矩阵
    gameHistory.forEach((item, index) => {
      const result = item.result;
      if (result === '平局！') {
        // 平局，在最后一个非平局结果的格子上标记和局
        if (index > 0 && currentCol > 0) {
          // 在上一个结果的格子旁边标记和局数量
          const tieCount = matrix[currentRow][currentCol - 1].includes('和') 
            ? parseInt(matrix[currentRow][currentCol - 1].split('和')[1] || '1') + 1
            : 1;
          matrix[currentRow][currentCol - 1] = `${matrix[currentRow][currentCol - 1].split('和')[0]}和${tieCount}`;
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
      }
    });
    
    // 渲染大路矩阵
    const rows = matrix.map((row, rowIndex) => (
      <TableRow key={rowIndex}>
        {row.map((cell, colIndex) => {
          if (!cell) return <TableCell key={colIndex} sx={{ p: 1, width: 40, height: 40 }}></TableCell>;
          
          const [type, tieCount] = cell.includes('和') ? cell.split('和') : [cell, ''];
          const color = type === '庄' ? 'red' : 'blue';
          
          return (
            <TableCell key={colIndex} sx={{ p: 1, width: 40, height: 40 }}>
              <Box 
                sx={{ 
                  width: 36,
                  height: 36,
                  backgroundColor: color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {type}
                {tieCount && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      fontSize: '0.75rem',
                      bgcolor: 'green',
                      color: 'white',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>大路</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {renderBeadPlate()}
      </Grid>
      <Grid item xs={12}>
        {renderBigRoad()}
      </Grid>
    </Grid>
  );
};

export default RoadMaps; 
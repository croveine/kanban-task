import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '../store';

interface BoardProps {
  boardId: string;
  index: number;
  onBoardClick: (boardId: string) => void;
}

const Board: React.FC<BoardProps> = memo(({ boardId, onBoardClick }) => {
  const board = useAppSelector(state => 
    state.boards.boards.find(b => b.boardId === boardId)
  );

  if (!board) return null;

  return (
    <Box
      onClick={() => onBoardClick(boardId)}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
        },
        transition: 'all 0.2s ease',
        width: '100%',
        maxWidth: 300,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {board.name}
      </Typography>
    </Box>
  );
});

Board.displayName = 'Board';

export default Board; 
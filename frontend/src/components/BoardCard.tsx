import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch } from '../store';
import { deleteBoard } from '../store/slices/boardSlice';
import type { Board } from '../types/board';

interface BoardCardProps {
  board: Board;
}

const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleDelete = () => {
    dispatch(deleteBoard(board.boardId));
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {board.name}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/board/${board.boardId}`)}
          sx={{ mb: 1 }}
        >
          Open Board
        </Button>
        <IconButton
          size="small"
          onClick={handleDelete}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <DeleteIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default BoardCard; 
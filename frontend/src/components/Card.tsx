import React, { memo, useCallback } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  Typography, 
  IconButton, 
  Paper,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch } from '../store';
import { deleteCard } from '../store/slices/cardSlice';
import type { Card as CardType } from '../types/card';

interface CardItemProps {
  card: CardType;
  index: number;
  onEdit: (card: CardType) => void;
  onError: (error: string) => void;
}

const CardItem: React.FC<CardItemProps> = memo(({ card, index, onEdit, onError }) => {
  const dispatch = useAppDispatch();

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this card?')) {
      const result = await dispatch(deleteCard(card.cardId));
      if (deleteCard.rejected.match(result)) {
        onError('Failed to delete card. Please try again.');
      }
    }
  }, [dispatch, card.cardId, onError]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(card);
  }, [onEdit, card]);

  const handleClick = useCallback(() => {
    onEdit(card);
  }, [onEdit, card]);

  if (!card?.cardId) {
    console.error('Invalid card data:', card);
    return null;
  }

  return (
    <Draggable draggableId={card.cardId} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          elevation={snapshot.isDragging ? 3 : 1}
          sx={{
            mb: 2,
            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: 3,
            },
            cursor: 'grab',
            '&:active': {
              cursor: 'grabbing',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.description}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            p: 1,
            borderTop: 1,
            borderColor: 'divider'
          }}>
            <IconButton 
              size="small" 
              onClick={handleEdit}
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleDelete}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Draggable>
  );
});

CardItem.displayName = 'CardItem';

export default CardItem; 
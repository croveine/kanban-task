import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useAppDispatch } from '../store';
import { updateCard } from '../store/slices/cardSlice';
import type { Card as CardType } from '../types/card';

interface EditCardProps {
  open: boolean;
  onClose: () => void;
  card: CardType | null;
}

const EditCard: React.FC<EditCardProps> = ({ open, onClose, card }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
    }
  }, [card]);

  const handleSubmit = async () => {
    if (!card || !title.trim()) return;

    try {
      await dispatch(updateCard({
        cardId: card.cardId,
        data: {
          title,
          description,
        }
      })).unwrap();
      
      onClose();
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Card</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!title.trim()}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCard; 
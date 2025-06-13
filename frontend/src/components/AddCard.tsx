import React, { useState } from 'react';
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
import { createCard } from '../store/slices/cardSlice';

interface AddCardProps {
  open: boolean;
  onClose: () => void;
  boardId: string;
  columnId: 'todo' | 'inProgress' | 'done';
}

const AddCard: React.FC<AddCardProps> = ({ open, onClose, boardId, columnId }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !boardId) {
      console.log('Cannot create card: missing title or boardId', { title, boardId });
      return;
    }

    try {
      console.log('Creating card with data:', {
        title: title.trim(),
        description: description.trim(),
        columnId,
        order: 0,
        boardId
      });

      const cardData = {
        title: title.trim(),
        description: description.trim(),
        columnId,
        order: 0,
        boardId
      };

      const result = await dispatch(createCard(cardData)).unwrap();
      console.log('Card created successfully:', result);
      
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create card:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Card</DialogTitle>
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
          disabled={!title.trim() || !boardId}
        >
          Add Card
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCard; 
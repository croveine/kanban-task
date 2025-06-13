import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { createBoard } from '../store/slices/boardSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface AddBoardProps {
  open: boolean;
  onClose: () => void;
  column: string;
}

const AddBoard: React.FC<AddBoardProps> = ({ open, onClose, column }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        await dispatch(createBoard({
          name: name.trim(),
          status: column
        })).unwrap();
        setName('');
        onClose();
      } catch (error) {
        console.error('Failed to create board:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Board</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Board Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              error={!name.trim()}
              helperText={!name.trim() ? 'Board name is required' : ''}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!name.trim()}
          >
            Create Board
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddBoard; 
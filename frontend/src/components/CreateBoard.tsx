import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { createBoard } from '../store/slices/boardSlice';

const CreateBoard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const boardError = useAppSelector((state) => state.boards.error);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    
    if (!name.trim()) {
      console.log('Name is empty, returning');
      return;
    }

    console.log('Submitting board with:', { name });
    
    try {
      console.log('Dispatching createBoard action');
      const result = await dispatch(createBoard({
        name: name.trim(),
        todoCards: [],
        inProgressCards: [],
        doneCards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })).unwrap();
      
      console.log('Board creation result:', result);
      
      if (result) {
        console.log('Board created successfully, navigating to home');
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('Button clicked');
    handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Create New Board
      </Typography>
      <form onSubmit={handleSubmit}>
        {boardError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {boardError}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Board Name"
          value={name}
          onChange={(e) => {
            console.log('Name changed:', e.target.value);
            setName(e.target.value);
          }}
          required
          margin="normal"
          autoFocus
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleButtonClick}
            disabled={!name.trim()}
            type="button"
          >
            Create Board
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            type="button"
          >
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CreateBoard; 
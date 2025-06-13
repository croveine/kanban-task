import React, { useState, memo, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Alert,
  IconButton,
  Snackbar,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchBoard, updateBoard, deleteBoard, clearCurrentBoard } from '../store/slices/boardSlice';
import { fetchCards, updateCardPosition } from '../store/slices/cardSlice';
import CardItem from './Card';
import AddBoard from './AddBoard';
import AddCard from './AddCard';
import EditCard from './EditCard';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Card as CardType } from '../types/card';

type ColumnType = 'todo' | 'inProgress' | 'done';

const COLUMN_TITLES = {
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done'
} as const;

const BoardColumn: React.FC<{
  column: ColumnType;
  cards: CardType[];
  onAddClick: (column: ColumnType) => void;
  onCardEdit: (card: CardType) => void;
  onError: (error: string | null) => void;
}> = memo(({ column, cards, onAddClick, onCardEdit, onError }) => {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 300,
        bgcolor: 'background.paper',
        borderRadius: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {COLUMN_TITLES[column]}
      </Typography>
      <Droppable 
        droppableId={column}
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={false}
        type="CARD"
      >
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ 
              height: 'calc(100vh - 250px)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'background.paper',
              p: 1,
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cards.map((card, index) => (
                <CardItem
                  key={card.cardId}
                  card={card}
                  index={index}
                  onEdit={onCardEdit}
                  onError={onError}
                />
              ))}
              {provided.placeholder}
            </Box>
            <Box
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 100,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => onAddClick(column)}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                }}
              >
                <AddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="body1" color="text.secondary">
                  Add Card
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Droppable>
    </Box>
  );
});

BoardColumn.displayName = 'BoardColumn';

const BoardList: React.FC = () => {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const currentBoard = useAppSelector((state) => state.boards.currentBoard);
  const cards = useAppSelector((state) => state.cards.cards);
  const boardError = useAppSelector((state) => state.boards.error);
  const [addCardOpen, setAddCardOpen] = useState<string | null>(null);
  const [editCardOpen, setEditCardOpen] = useState<CardType | null>(null);
  const [boardId, setBoardId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isAddBoardOpen, setIsAddBoardOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBoard) {
      dispatch(fetchCards(currentBoard.boardId));
    }
  }, [currentBoard, dispatch]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const card = cards.find(c => c.cardId === draggableId);
    if (!card) return;

    dispatch(updateCardPosition({
      cardId: draggableId,
      sourceColumn: source.droppableId as ColumnType,
      destinationColumn: destination.droppableId as ColumnType,
      sourceIndex: source.index,
      destinationIndex: destination.index
    }));
  }, [cards, dispatch]);

  const getColumnCards = useCallback((column: ColumnType) => {
    return cards
      .filter(card => card.columnId === column && card.cardId)
      .sort((a, b) => a.order - b.order);
  }, [cards]);

  const handleBoardClick = useCallback((boardId: string) => {
    const board = boards.find(b => b.boardId === boardId);
    if (board) {
      dispatch(fetchBoard(boardId));
    }
  }, [boards, dispatch]);

  const handleDeleteBoard = useCallback(async (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await dispatch(deleteBoard(boardId)).unwrap();
        dispatch(clearCurrentBoard());
      } catch (error) {
        console.error('Failed to delete board:', error);
      }
    }
  }, [dispatch]);

  const handleEditBoard = useCallback(() => {
    if (currentBoard) {
      setEditName(currentBoard.name);
      setIsEditing(true);
    }
  }, [currentBoard]);

  const handleSaveBoard = async () => {
    if (currentBoard) {
      try {
        await dispatch(updateBoard({
          id: currentBoard.boardId,
          name: editName
        })).unwrap();
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update board:', error);
      }
    }
  };

  const handleLoadBoard = async () => {
    if (boardId.trim()) {
      try {
        const existingBoard = boards.find(b => b.name.toLowerCase() === boardId.toLowerCase());
        if (existingBoard) {
          dispatch(fetchBoard(existingBoard.boardId));
          return;
        }
        
        await dispatch(fetchBoard(boardId)).unwrap();
      } catch (error) {
        console.error('Failed to load board:', error);
        setError('No board found with this ID or name');
      }
    }
  };

  const handleCardEdit = useCallback((card: CardType) => {
    setEditCardOpen(card);
  }, []);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  const columns: ColumnType[] = ['todo', 'inProgress', 'done'];

  const renderBoard = () => {
    if (!currentBoard) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {boards.map((board) => (
            <Box
              key={board.boardId}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => handleBoardClick(board.boardId)}
            >
              <Box>
                <Typography variant="h6">{board.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {board.boardId}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBoard(board.boardId);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        {columns.map((column) => (
          <BoardColumn
            key={column}
            column={column}
            cards={getColumnCards(column)}
            onAddClick={setAddCardOpen}
            onCardEdit={handleCardEdit}
            onError={setError}
          />
        ))}
      </Box>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {currentBoard && (
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => dispatch(clearCurrentBoard())}
              >
                Back to Boards
              </Button>
            )}
            {currentBoard ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isEditing ? (
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: 300 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="h4">
                        {currentBoard.name} Board
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {currentBoard.boardId}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={handleEditBoard}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteBoard(currentBoard.boardId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSaveBoard}
                      disabled={!editName.trim()}
                    >
                      Save
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="h4">
                Kanban Board
              </Typography>
            )}
          </Box>
          {!currentBoard && (
            <Button
              variant="contained"
              onClick={() => setIsAddBoardOpen(true)}
              startIcon={<AddIcon />}
            >
              Add Board
            </Button>
          )}
        </Box>
        
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search boards by name or ID"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    variant="contained" 
                    onClick={handleLoadBoard}
                    disabled={!boardId.trim()}
                  >
                    Search
                  </Button>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {boardError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {boardError}
          </Alert>
        )}

        {renderBoard()}

        <AddBoard
          open={isAddBoardOpen}
          onClose={() => setIsAddBoardOpen(false)}
          column="todo"
        />

        <AddCard
          open={addCardOpen !== null}
          onClose={() => setAddCardOpen(null)}
          boardId={currentBoard?.boardId ?? ''}
          columnId={addCardOpen as 'todo' | 'inProgress' | 'done' || 'todo'}
        />

        <EditCard
          open={editCardOpen !== null}
          onClose={() => setEditCardOpen(null)}
          card={editCardOpen}
        />

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DragDropContext>
  );
};

export default BoardList; 
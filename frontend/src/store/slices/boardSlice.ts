import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Board } from '../../types/board';
import { api } from '../../api';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;
}

// Load boards from localStorage on initial state
const loadBoardsFromStorage = (): Board[] => {
  try {
    const savedBoards = localStorage.getItem('boards');
    if (!savedBoards) return [];
    
    const boards = JSON.parse(savedBoards);
    // Ensure each board has a valid boardId
    return boards.map((board: Board) => ({
      ...board,
      boardId: board.boardId || crypto.randomUUID()
    }));
  } catch (error) {
    console.error('Error loading boards from localStorage:', error);
    return [];
  }
};

const initialState: BoardState = {
  boards: loadBoardsFromStorage(),
  currentBoard: null,
  loading: false,
  error: null,
};

// Save boards to localStorage whenever they change
const saveBoardsToStorage = (boards: Board[]) => {
  try {
    localStorage.setItem('boards', JSON.stringify(boards));
  } catch (error) {
    console.error('Error saving boards to localStorage:', error);
  }
};

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async () => {
    const response = await api.get('/boards');
    return response.data;
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId: string) => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (data: Omit<Board, 'boardId'>) => {
    const response = await api.post('/boards', {
      ...data,
      boardId: crypto.randomUUID()
    });
    return response.data;
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, ...board }: Partial<Board> & { id: string }) => {
    const response = await api.put(`/boards/${id}`, {
      ...board,
      boardId: id
    });
    return response.data;
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId: string) => {
    await api.delete(`/boards/${boardId}`);
    return boardId;
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setBoards: (state, action) => {
      state.boards = action.payload;
      saveBoardsToStorage(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure each board has a valid boardId
        const boards = action.payload.map((board: Board) => ({
          ...board,
          boardId: board.boardId || crypto.randomUUID()
        }));
        state.boards = boards;
        saveBoardsToStorage(boards);
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch boards';
      })
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        const board = {
          ...action.payload,
          boardId: action.payload.boardId ?? crypto.randomUUID()
        };
        state.currentBoard = board;
        // Update the board in the boards array
        const index = state.boards.findIndex((b: Board) => b.boardId === board.boardId);
        if (index !== -1) {
          state.boards[index] = board;
          saveBoardsToStorage(state.boards);
        }
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch board';
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        const board = {
          ...action.payload,
          boardId: action.payload.boardId ?? crypto.randomUUID()
        };
        state.boards.push(board);
        saveBoardsToStorage(state.boards);
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        const board = {
          ...action.payload,
          boardId: action.payload.boardId ?? crypto.randomUUID()
        };
        const index = state.boards.findIndex((b: Board) => b.boardId === board.boardId);
        if (index !== -1) {
          state.boards[index] = board;
          if (state.currentBoard?.boardId === board.boardId) {
            state.currentBoard = board;
          }
          saveBoardsToStorage(state.boards);
        }
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((b: Board) => b.boardId !== action.payload);
        if (state.currentBoard?.boardId === action.payload) {
          state.currentBoard = null;
        }
        saveBoardsToStorage(state.boards);
      });
  },
});

export const { clearCurrentBoard, setError, clearError, setBoards } = boardSlice.actions;
export default boardSlice.reducer; 
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Card } from '../../types/card';
import { api } from '../../api';
import axios from 'axios';
import type { RootState } from '../../store';

const API_URL = 'http://localhost:3000/api';

interface CardState {
  cards: Card[];
  loading: boolean;
  error: string | null;
  lastValidState: {
    items: Card[];
    loading: boolean;
    error: string | null;
  } | null;
}

const initialState: CardState = {
  cards: [],
  loading: false,
  error: null,
  lastValidState: null,
};

export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (boardId: string) => {
    const response = await api.get(`/cards?boardId=${boardId}`);
    return response.data;
  }
);

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData: Omit<Card, 'cardId' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Making API call to create card:', cardData);
      const response = await api.post('/cards', cardData);
      console.log('API response:', response.data);
      // Ensure cardId is present in the response
      const cardWithId = {
        ...response.data,
        cardId: response.data.cardId || crypto.randomUUID()
      };
      return cardWithId;
    } catch (error) {
      console.error('API error creating card:', error);
      throw error;
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ cardId, data }: { cardId: string; data: Partial<Card> }) => {
    if (!cardId) {
      throw new Error('Card ID is required');
    }
    const response = await api.patch(`/cards/${cardId}`, data);
    return response.data;
  }
);

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string, { rejectWithValue }) => {
    if (!cardId) {
      return rejectWithValue('Card ID is required');
    }
    try {
      const response = await api.delete(`/cards/${cardId}`);
      return response.data.cardId ?? cardId;
    } catch (error) {
      console.error('Error deleting card from server:', error);
      return rejectWithValue('Failed to delete card from server');
    }
  }
);

export const updateCardPosition = createAsyncThunk(
  'cards/updatePosition',
  async (
    {
      cardId,
      sourceColumn,
      destinationColumn,
      sourceIndex,
      destinationIndex,
    }: {
      cardId: string;
      sourceColumn: string;
      destinationColumn: string;
      sourceIndex: number;
      destinationIndex: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const card = state.cards.cards.find(c => c.cardId === cardId);
      
      if (!card) {
        throw new Error('Card not found');
      }

      const response = await axios.put(
        `${API_URL}/cards/${cardId}/position`,
        {
          sourceColumn,
          destinationColumn,
          sourceIndex,
          destinationIndex,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating card position:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update card position');
    }
  }
);

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch cards
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
        state.error = null;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cards';
      })
      // Create card
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        console.log('Card creation fulfilled:', action.payload);
        if (action.payload?.cardId) {
          state.cards.push(action.payload);
        } else {
          console.error('Invalid card data received:', action.payload);
        }
        state.error = null;
      })
      .addCase(createCard.rejected, (state, action) => {
        console.error('Card creation rejected:', action.error);
        state.error = action.error.message || 'Failed to create card';
      })
      // Update card
      .addCase(updateCard.fulfilled, (state, action) => {
        if (action.payload.cardId) {
          const index = state.cards.findIndex(card => card.cardId === action.payload.cardId);
          if (index !== -1) {
            state.cards[index] = action.payload;
          }
        }
      })
      // Delete card
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter(card => card.cardId !== action.payload);
        state.error = null;
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete card';
      })
      // Update card position
      .addCase(updateCardPosition.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        
        // Optimistically update the card's position
        const { cardId, sourceColumn, destinationColumn, sourceIndex, destinationIndex } = action.meta.arg;
        const card = state.cards.find(c => c.cardId === cardId);
        if (card) {
          // Store the original state for rollback
          state.lastValidState = {
            items: [...state.cards],
            loading: state.loading,
            error: state.error
          };
          
          // Update the card's position immediately
          card.columnId = destinationColumn as 'todo' | 'inProgress' | 'done';
          card.order = destinationIndex;
          
          // Reorder other cards in the source and destination columns
          state.cards = state.cards.map(c => {
            if (c.cardId === cardId) return card;
            
            if (c.columnId === sourceColumn) {
              if (c.order >= sourceIndex) {
                return { ...c, order: c.order - 1 };
              }
            }
            
            if (c.columnId === destinationColumn) {
              if (c.order >= destinationIndex) {
                return { ...c, order: c.order + 1 };
              }
            }
            
            return c;
          });
        }
      })
      .addCase(updateCardPosition.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // The optimistic update already handled the UI update
      })
      .addCase(updateCardPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        
        // Rollback to the last valid state if it exists
        if (state.lastValidState) {
          state.cards = state.lastValidState.items;
          state.loading = state.lastValidState.loading;
          state.error = state.lastValidState.error;
          state.lastValidState = null;
        }
      });
  },
});

export default cardSlice.reducer; 
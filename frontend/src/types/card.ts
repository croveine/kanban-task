export interface Card {
  cardId: string;
  title: string;
  description: string;
  boardId: string;
  columnId: 'todo' | 'inProgress' | 'done';
  order: number;
  createdAt: string;
  updatedAt: string;
} 
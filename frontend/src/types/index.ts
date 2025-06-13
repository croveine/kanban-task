export interface Board {
  id: string;
  name: string;
  todoCards: string[];
  inProgressCards: string[];
  doneCards: string[];
  createdAt: string;
  updatedAt: string;
}

export { Card } from './card';

export interface Column {
  id: string;
  name: string;
  boardId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
} 
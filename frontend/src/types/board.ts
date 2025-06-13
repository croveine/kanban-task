export interface Board {
  boardId: string;
  name: string;
  todoCards: string[];
  inProgressCards: string[];
  doneCards: string[];
  createdAt: string;
  updatedAt: string;
} 
export class CreateBoardDto {
  name: string;
}

export class UpdateBoardDto {
  name?: string;
  todoCards?: string[];
  inProgressCards?: string[];
  doneCards?: string[];
}

export class BoardResponseDto {
  id: string;
  name: string;
  boardId: string;
  todoCards: string[];
  inProgressCards: string[];
  doneCards: string[];
  createdAt: Date;
  updatedAt: Date;
} 
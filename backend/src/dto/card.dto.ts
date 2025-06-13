import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  columnId: string;

  @IsString()
  boardId: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CardResponseDto {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
} 
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsString()
  @IsNotEmpty()
  boardId: string;
} 
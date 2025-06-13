import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class UpdateCardPositionDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['todo', 'inProgress', 'done'])
  sourceColumn: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['todo', 'inProgress', 'done'])
  destinationColumn: string;

  @IsNumber()
  @IsNotEmpty()
  sourceIndex: number;

  @IsNumber()
  @IsNotEmpty()
  destinationIndex: number;
} 
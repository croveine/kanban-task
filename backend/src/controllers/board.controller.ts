import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { BoardService } from '../services/board.service';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Board } from '../schemas/board.schema';

@Controller('boards')
export class BoardController {
  private readonly logger = new Logger(BoardController.name);

  constructor(private readonly boardService: BoardService) {}

  @Post()
  async create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      this.logger.debug(`Creating board: ${createBoardDto.name}`);
      const board = await this.boardService.create(createBoardDto);
      this.logger.debug(`Board created: ${board.boardId}`);
      return board;
    } catch (error) {
      this.logger.error(`Failed to create board: ${error.message}`);
      throw new InternalServerErrorException('Failed to create board');
    }
  }

  @Get()
  async findAll(): Promise<Board[]> {
    try {
      return await this.boardService.findAll();
    } catch (error) {
      this.logger.error(`Failed to fetch boards: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch boards');
    }
  }

  @Get(':boardId')
  async findOne(@Param('boardId') boardId: string): Promise<Board> {
    try {
      return await this.boardService.findOne(boardId);
    } catch (error) {
      this.logger.error(`Failed to fetch board ${boardId}: ${error.message}`);
      throw error;
    }
  }

  @Patch(':boardId')
  async update(
    @Param('boardId') boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    try {
      return await this.boardService.update(boardId, updateBoardDto);
    } catch (error) {
      this.logger.error(`Failed to update board ${boardId}: ${error.message}`);
      throw error;
    }
  }

  @Delete(':boardId')
  async remove(@Param('boardId') boardId: string): Promise<void> {
    try {
      await this.boardService.remove(boardId);
    } catch (error) {
      this.logger.error(`Failed to delete board ${boardId}: ${error.message}`);
      throw error;
    }
  }
} 
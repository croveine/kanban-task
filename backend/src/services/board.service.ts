import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board } from '../schemas/board.schema';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
  ) {}

  async findAll(): Promise<Board[]> {
    try {
      return await this.boardModel.find().lean().exec();
    } catch (error) {
      this.logger.error(`Database error while fetching boards: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Failed to fetch boards',
        cause: error,
      });
    }
  }

  async findOne(boardId: string): Promise<Board> {
    try {
      const board = await this.boardModel.findOne({ boardId }).lean().exec();
      if (!board) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }
      return board;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Database error while fetching board ${boardId}: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Failed to fetch board',
        cause: error,
      });
    }
  }

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    try {
      const boardId = uuidv4();
      const createdBoard = new this.boardModel({
        ...createBoardDto,
        boardId,
      });
      return await createdBoard.save();
    } catch (error) {
      this.logger.error(`Database error while creating board: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Failed to create board',
        cause: error,
      });
    }
  }

  async update(boardId: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    try {
      const updatedBoard = await this.boardModel
        .findOneAndUpdate(
          { boardId },
          { $set: updateBoardDto },
          { new: true, lean: true },
        )
        .exec();
      if (!updatedBoard) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }
      return updatedBoard;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Database error while updating board ${boardId}: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Failed to update board',
        cause: error,
      });
    }
  }

  async remove(boardId: string): Promise<void> {
    try {
      const result = await this.boardModel.deleteOne({ boardId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Board with ID ${boardId} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Database error while deleting board ${boardId}: ${error.message}`);
      throw new InternalServerErrorException({
        message: 'Failed to delete board',
        cause: error,
      });
    }
  }
} 
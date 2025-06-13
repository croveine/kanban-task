import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BoardService } from './board.service';
import { Board } from '../schemas/board.schema';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';

describe('BoardService', () => {
  let service: BoardService;

  const mockBoard = {
    boardId: 'test-board-id',
    name: 'Test Board',
    todoCards: [],
    inProgressCards: [],
    doneCards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getModelToken(Board.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const boards = [mockBoard];
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(boards),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(boards);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a board by id', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockBoard),
        }),
      });

      const result = await service.findOne('test-board-id');
      expect(result).toEqual(mockBoard);
      expect(mockModel.findOne).toHaveBeenCalledWith({ boardId: 'test-board-id' });
    });

    it('should throw NotFoundException if board not found', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.findOne.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(service.findOne('test-board-id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardDto: CreateBoardDto = { name: 'New Board' };
      const newBoard = { ...mockBoard, ...createBoardDto };
      
      mockModel.save.mockResolvedValue(newBoard);

      const result = await service.create(createBoardDto);
      expect(result).toEqual(newBoard);
      expect(mockModel.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      const createBoardDto: CreateBoardDto = { name: 'New Board' };
      mockModel.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createBoardDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board' };
      const updatedBoard = { ...mockBoard, ...updateBoardDto };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBoard),
      });

      const result = await service.update('test-board-id', updateBoardDto);
      expect(result).toEqual(updatedBoard);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { boardId: 'test-board-id' },
        { $set: updateBoardDto },
        { new: true, lean: true },
      );
    });

    it('should throw NotFoundException if board not found', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board' };
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('non-existent', updateBoardDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const updateBoardDto: UpdateBoardDto = { name: 'Updated Board' };
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.update('test-board-id', updateBoardDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await service.remove('test-board-id');
      expect(mockModel.deleteOne).toHaveBeenCalledWith({ boardId: 'test-board-id' });
    });

    it('should throw NotFoundException if board not found', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.remove('test-board-id')).rejects.toThrow(InternalServerErrorException);
    });
  });
}); 
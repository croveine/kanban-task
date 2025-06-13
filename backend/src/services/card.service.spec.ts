import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CardService } from './card.service';
import { Card } from '../schemas/card.schema';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCardDto, UpdateCardDto } from '../dto/card.dto';
import { UpdateCardPositionDto } from '../dto/update-card-position.dto';

describe('CardService', () => {
  let service: CardService;

  const mockCard = {
    cardId: 'test-card-id',
    title: 'Test Card',
    description: 'Test Description',
    columnId: 'todo',
    boardId: 'test-board-id',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getModelToken(Card.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cards', async () => {
      const cards = [mockCard];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(cards),
        }),
      });

      const result = await service.findAll('test-board-id');
      expect(result).toEqual(cards);
      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(service.findAll('test-board-id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    it('should create a new card', async () => {
      const createCardDto: CreateCardDto = {
        title: 'New Card',
        description: 'New Description',
        columnId: 'todo',
        boardId: 'test-board-id',
      };

      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      mockModel.save.mockResolvedValue(mockCard);

      const result = await service.create(createCardDto);
      expect(result).toEqual(mockCard);
      expect(mockModel.save).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      const createCardDto: CreateCardDto = {
        title: 'New Card',
        description: 'New Description',
        columnId: 'todo',
        boardId: 'test-board-id',
      };

      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(service.create(createCardDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a card by id', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCard),
      });

      const result = await service.findOne('test-card-id');
      expect(result).toEqual(mockCard);
      expect(mockModel.findOne).toHaveBeenCalledWith({ cardId: 'test-card-id' });
    });

    it('should throw NotFoundException if card not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findOne('test-card-id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
        description: 'Updated Description',
      };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockCard, ...updateCardDto }),
      });

      const result = await service.update('test-card-id', updateCardDto);
      expect(result).toEqual({ ...mockCard, ...updateCardDto });
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { cardId: 'test-card-id' },
        updateCardDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if card not found', async () => {
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
        description: 'Updated Description',
      };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update('non-existent', updateCardDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const updateCardDto: UpdateCardDto = {
        title: 'Updated Card',
        description: 'Updated Description',
      };

      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.update('test-card-id', updateCardDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCard),
      });

      const result = await service.remove('test-card-id');
      expect(result).toEqual(mockCard);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ cardId: 'test-card-id' });
    });

    it('should throw NotFoundException if card not found', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.remove('test-card-id')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePosition', () => {
    it('should update card position', async () => {
      const positionData: UpdateCardPositionDto = {
        sourceColumn: 'todo',
        destinationColumn: 'inProgress',
        sourceIndex: 0,
        destinationIndex: 1,
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCard),
      });

      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      mockModel.save.mockResolvedValue({ ...mockCard, columnId: 'inProgress', order: 1 });

      const result = await service.updatePosition('test-card-id', positionData);
      expect(result).toEqual({ ...mockCard, columnId: 'inProgress', order: 1 });
    });

    it('should throw NotFoundException if card not found', async () => {
      const positionData: UpdateCardPositionDto = {
        sourceColumn: 'todo',
        destinationColumn: 'inProgress',
        sourceIndex: 0,
        destinationIndex: 1,
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updatePosition('non-existent', positionData)).rejects.toThrow(NotFoundException);
    });

    it('should throw Error for invalid source column', async () => {
      const positionData: UpdateCardPositionDto = {
        sourceColumn: 'invalid',
        destinationColumn: 'inProgress',
        sourceIndex: 0,
        destinationIndex: 1,
      };

      await expect(service.updatePosition('test-card-id', positionData)).rejects.toThrow('Invalid source column: invalid');
    });

    it('should throw Error for invalid destination column', async () => {
      const positionData: UpdateCardPositionDto = {
        sourceColumn: 'todo',
        destinationColumn: 'invalid',
        sourceIndex: 0,
        destinationIndex: 1,
      };

      await expect(service.updatePosition('test-card-id', positionData)).rejects.toThrow('Invalid destination column: invalid');
    });
  });
}); 
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { Card, CardDocument } from '../schemas/card.schema';
import { CreateCardDto, UpdateCardDto } from '../dto/card.dto';
import { UpdateCardPositionDto } from '../dto/update-card-position.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CardService {
  private readonly logger = new Logger(CardService.name);

  constructor(
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
  ) {}

  private transformCard(card: Document & Card) {
    const { cardId, ...rest } = card.toObject();
    return {
      cardId,
      ...rest,
    };
  }

  async findAll(boardId: string): Promise<Card[]> {
    try {
      const query = boardId ? { boardId } : {};
      const cards = await this.cardModel.find(query).sort({ order: 1 }).exec();
      return cards.map(card => this.transformCard(card));
    } catch (error) {
      this.logger.error(`Failed to fetch cards: ${error.message}`);
      throw error;
    }
  }

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const createdCard = new this.cardModel({
      ...createCardDto,
      id: uuidv4(),
    });
    return createdCard.save();
  }

  async findOne(id: string): Promise<Card> {
    try {
      const card = await this.cardModel.findOne({ id }).exec();
      if (!card) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }
      return this.transformCard(card);
    } catch (error) {
      this.logger.error(`Failed to find card ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    try {
      const updatedCard = await this.cardModel
        .findOneAndUpdate({ id }, updateCardDto, { new: true })
        .exec();
      if (!updatedCard) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }
      return this.transformCard(updatedCard);
    } catch (error) {
      this.logger.error(`Failed to update card ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<Card> {
    try {
      const deletedCard = await this.cardModel.findOneAndDelete({ id }).exec();
      if (!deletedCard) {
        throw new NotFoundException(`Card with ID ${id} not found`);
      }
      return this.transformCard(deletedCard);
    } catch (error) {
      this.logger.error(`Failed to delete card ${id}: ${error.message}`);
      throw error;
    }
  }

  async updatePosition(
    id: string,
    positionData: UpdateCardPositionDto,
  ): Promise<Card> {
    try {
      this.logger.log(`Updating position for card ${id} with data: ${JSON.stringify(positionData)}`);
      
      // Validate column IDs
      if (!['todo', 'inProgress', 'done'].includes(positionData.sourceColumn)) {
        this.logger.error(`Invalid source column: ${positionData.sourceColumn}`);
        throw new Error(`Invalid source column: ${positionData.sourceColumn}`);
      }
      if (!['todo', 'inProgress', 'done'].includes(positionData.destinationColumn)) {
        this.logger.error(`Invalid destination column: ${positionData.destinationColumn}`);
        throw new Error(`Invalid destination column: ${positionData.destinationColumn}`);
      }

      // Find the card
      const card = await this.cardModel.findOne({ id });
      if (!card) {
        this.logger.error(`Card with ID ${id} not found`);
        throw new NotFoundException(`Card with ID ${id} not found`);
      }

      this.logger.log(`Found card: ${JSON.stringify(card.toObject())}`);

      // Update the card's column
      const oldColumnId = card.columnId;
      card.columnId = positionData.destinationColumn;
      this.logger.log(`Updated card column from ${oldColumnId} to ${positionData.destinationColumn}`);

      // Get all cards in both source and destination columns
      const [sourceCards, destinationCards] = await Promise.all([
        this.cardModel
          .find({ columnId: positionData.sourceColumn })
          .sort({ order: 1 })
          .exec(),
        this.cardModel
          .find({ columnId: positionData.destinationColumn })
          .sort({ order: 1 })
          .exec(),
      ]);

      this.logger.log(`Found ${sourceCards.length} cards in source column and ${destinationCards.length} cards in destination column`);

      // Reorder cards in source column
      const updatedSourceCards = sourceCards
        .filter(c => c.cardId !== id)
        .map((c, index) => {
          const updatedCard = c.toObject();
          updatedCard.order = index;
          return this.cardModel.findOneAndUpdate(
            { cardId: c.cardId },
            { order: index },
            { new: true }
          );
        });

      // Reorder cards in destination column
      const updatedDestinationCards = destinationCards
        .filter(c => c.cardId !== id)
        .map((c, index) => {
          const updatedCard = c.toObject();
          if (index >= positionData.destinationIndex) {
            updatedCard.order = index + 1;
          } else {
            updatedCard.order = index;
          }
          return this.cardModel.findOneAndUpdate(
            { cardId: c.cardId },
            { order: updatedCard.order },
            { new: true }
          );
        });

      // Set the moved card's order
      card.order = positionData.destinationIndex;
      this.logger.log(`Set moved card order to ${positionData.destinationIndex}`);

      // Save all updated cards
      try {
        const savePromises = [
          ...updatedSourceCards,
          ...updatedDestinationCards,
          card.save(),
        ];
        
        this.logger.log(`Attempting to save ${savePromises.length} cards`);
        await Promise.all(savePromises);
        this.logger.log('Successfully saved all card updates');
      } catch (saveError) {
        this.logger.error(`Failed to save card updates: ${saveError.message}`);
        this.logger.error(`Save error stack: ${saveError.stack}`);
        throw saveError;
      }

      return this.transformCard(card);
    } catch (error) {
      this.logger.error(`Failed to update card position ${id}: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }
} 
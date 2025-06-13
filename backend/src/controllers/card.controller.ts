import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Patch,
  Logger,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CardService } from '../services/card.service';
import { CreateCardDto, UpdateCardDto } from '../dto/card.dto';
import { UpdateCardPositionDto } from '../dto/update-card-position.dto';
import { Card } from '../schemas/card.schema';

@Controller('cards')
export class CardController {
  private readonly logger = new Logger(CardController.name);

  constructor(private readonly cardService: CardService) {}

  @Post()
  async create(@Body() createCardDto: CreateCardDto) {
    try {
      this.logger.log(`Creating card: ${JSON.stringify(createCardDto)}`);
      return await this.cardService.create(createCardDto);
    } catch (error) {
      this.logger.error(`Failed to create card: ${error.message}`);
      throw error;
    }
  }

  @Get()
  async findAll(@Query('boardId') boardId: string) {
    try {
      return await this.cardService.findAll(boardId);
    } catch (error) {
      this.logger.error(`Failed to fetch cards: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    try {
      return await this.cardService.update(id, updateCardDto);
    } catch (error) {
      this.logger.error(`Failed to update card: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.cardService.remove(id);
    } catch (error) {
      this.logger.error(`Failed to delete card: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/position')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = error.constraints || {};
        return Object.values(constraints).join(', ');
      });
      return new HttpException(messages.join('; '), HttpStatus.BAD_REQUEST);
    }
  }))
  async updatePosition(
    @Param('id') id: string,
    @Body() positionData: UpdateCardPositionDto,
  ): Promise<Card> {
    try {
      this.logger.log(`Received position update request for card ${id}`);
      this.logger.log(`Position data: ${JSON.stringify(positionData)}`);
      
      // Validate the data
      if (!positionData.sourceColumn || !positionData.destinationColumn) {
        throw new HttpException('Source and destination columns are required', HttpStatus.BAD_REQUEST);
      }

      if (!['todo', 'inProgress', 'done'].includes(positionData.sourceColumn)) {
        throw new HttpException(`Invalid source column: ${positionData.sourceColumn}`, HttpStatus.BAD_REQUEST);
      }

      if (!['todo', 'inProgress', 'done'].includes(positionData.destinationColumn)) {
        throw new HttpException(`Invalid destination column: ${positionData.destinationColumn}`, HttpStatus.BAD_REQUEST);
      }

      if (typeof positionData.sourceIndex !== 'number' || typeof positionData.destinationIndex !== 'number') {
        throw new HttpException('Source and destination indices must be numbers', HttpStatus.BAD_REQUEST);
      }
      
      const result = await this.cardService.updatePosition(id, positionData);
      this.logger.log(`Successfully updated card position: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update card position: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 
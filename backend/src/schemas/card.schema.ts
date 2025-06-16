import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card extends Document {
  @Prop({ required: true, unique: true })
  cardId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['todo', 'inProgress', 'done'] })
  columnId: string;

  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  order: number;
}

export const CardSchema = SchemaFactory.createForClass(Card); 
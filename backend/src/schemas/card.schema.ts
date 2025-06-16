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

  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  columnId: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CardSchema = SchemaFactory.createForClass(Card); 
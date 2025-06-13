import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  boardId: string;

  @Prop({ required: true })
  columnId: 'todo' | 'inProgress' | 'done';

  @Prop({ required: true })
  order: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CardSchema = SchemaFactory.createForClass(Card); 
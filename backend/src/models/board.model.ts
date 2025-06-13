import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema()
export class Board {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  boardId: string;

  @Prop({ type: [{ type: String, ref: 'Card' }], default: [] })
  todoCards: string[];

  @Prop({ type: [{ type: String, ref: 'Card' }], default: [] })
  inProgressCards: string[];

  @Prop({ type: [{ type: String, ref: 'Card' }], default: [] })
  doneCards: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board); 
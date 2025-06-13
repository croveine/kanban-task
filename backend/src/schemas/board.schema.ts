import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Board extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  boardId: string;

  @Prop({ required: true, default: 'todo' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board); 
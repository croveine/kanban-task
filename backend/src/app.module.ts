import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './modules/board.module';
import { CardModule } from './modules/card.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/kanban', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      autoIndex: true,
      autoCreate: true,
    } as any),
    BoardModule,
    CardModule,
  ],
})
export class AppModule {}

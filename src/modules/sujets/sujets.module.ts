import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SujetsController } from './sujets.controller';
import { SujetsService } from './sujets.service';
import { Sujet } from './entities/sujet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sujet])],
  controllers: [SujetsController],
  providers: [SujetsService],
  exports: [SujetsService],
})
export class SujetsModule {}
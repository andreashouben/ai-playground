import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.js';
import { OllamaService } from './ollama.service.js';

@Module({
  controllers: [ChatController],
  providers: [OllamaService],
})
export class AppModule {}

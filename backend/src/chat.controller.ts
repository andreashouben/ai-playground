import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { OllamaService } from './ollama.service.js';
import type { ChatMessage } from './ollama.service.js';

@Controller('chat')
export class ChatController {
  constructor(private readonly ollama: OllamaService) {}

  @Post()
  async chat(@Body() body: { messages: ChatMessage[] }, @Res() res: Response) {
    res.set('Content-Type', 'text/event-stream');

    const abortController = new AbortController();
    
    res.on('close', () => abortController.abort());
    
    
    for await (const delta of this.ollama.chatStream(body.messages, abortController.signal)) {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }

    res.end();
  }
}

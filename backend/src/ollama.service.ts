import { Injectable } from '@nestjs/common';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OllamaService {
  private readonly baseUrl = 'http://localhost:11434/v1';
  private readonly model = 'qwen2.5:3b';

  async *chatStream(messages: ChatMessage[], signal: AbortSignal): AsyncGenerator<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: true })
      ,signal
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama antwortete mit ${response.status}: ${await response.text()}`);
    }

    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Ein Stück vom Netzwerk kann mitten in einem Event enden:
      // nur vollständige Events (bis \n\n) verarbeiten, den Rest für später aufheben.
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const event of events) {
        const data = event.replace(/^data: /, '');
        if (data === '[DONE]') return;

        const delta = JSON.parse(data).choices[0].delta.content;
        if (delta) yield delta;
      }
    }
  }
}

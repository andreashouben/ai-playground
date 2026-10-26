# Zum Nachschauen

## Streaming-Format (`choices[0].delta.content`, `[DONE]`)
- [ ] OpenAI API Reference, Chat Completions, Streaming (Chunk-Objekt mit `delta`):
      https://platform.openai.com/docs/api-reference/chat-streaming
      (per curl 403, im Browser öffnen; Pfad könnte sich geändert haben)
- [ ] Ollama: OpenAI-Kompatibilität (was Ollama davon unterstützt):
      https://docs.ollama.com/api/openai-compatibility
- [ ] Server-Sent Events, Spezifikation (Format `data:`, `\n\n`):
      https://html.spec.whatwg.org/multipage/server-sent-events.html
- [ ] Mit `curl -N` gegen Ollama prüfen, ob `delta.content` und `\n\n` wirklich so aussehen.

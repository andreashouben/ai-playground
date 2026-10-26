# ai-playground

Übungsprojekt, um Chat-Streaming kennenzulernen: Ein React-Frontend spricht mit einem
NestJS-Backend, das die Antworten eines lokalen Ollama-Modells Token für Token durchreicht.

```
Browser (Vite/React)  --POST /chat-->  NestJS  --POST /v1/chat/completions-->  Ollama
        :5173         <--SSE-Stream--   :3000   <--------- SSE-Stream ---------   :11434
```

## Voraussetzungen

- Node.js und npm
- [Ollama](https://ollama.com), laufend auf `localhost:11434`, mit dem Modell `qwen2.5:3b`
  (`ollama pull qwen2.5:3b`)

## Starten

```bash
# Terminal 1
cd backend
npm install
npm run start:dev      # http://localhost:3000

# Terminal 2
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Das Backend erlaubt CORS nur für `http://localhost:5173` (siehe `backend/src/main.ts`).

## Ohne Frontend testen

```bash
curl -N -X POST localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Zähl von 1 bis 10"}]}'
```

`-N` schaltet das Puffern von `curl` ab, sonst siehst du die Stücke nicht einzeln.

## Aufbau

**Backend** (`backend/src`, NestJS)
- `chat.controller.ts`: `POST /chat` nimmt `{ messages: [{ role, content }] }` entgegen und schreibt
  für jedes Stück der Antwort ein Server-Sent Event: `data: {"delta":"..."}\n\n`. Die Verbindung
  wird nach der Antwort geschlossen. Bricht der Client ab (`res.on('close')`), wird der
  Aufruf an Ollama über einen `AbortController` abgebrochen.
- `ollama.service.ts`: Ruft die OpenAI-kompatible API von Ollama mit `fetch` auf (`stream: true`)
  und liefert die Textstücke als async Generator. Modell und URL sind fest eingetragen.

**Frontend** (`frontend/src/App.tsx`, Vite + React + TypeScript)
- Eingabefeld und Nachrichtenliste. Beim Absenden geht die ganze History an das Backend, weil
  Ollama sich nichts merkt. Die Antwort wird per `fetch` und Stream gelesen und Stück für Stück
  in die letzte Assistenten-Nachricht geschrieben. Ein `AbortController` bricht den Request ab.

## Was dabei gelernt werden soll

- Server-Sent Events: `data:`-Zeilen, Leerzeile als Trenner
- `res.write` und `res.end` statt eines Rückgabewerts (`@Res()` in NestJS)
- async Generatoren (`async *`, `yield`, `for await`)
- Streams lesen: `getReader()`, `TextDecoder`, Puffer für unvollständige Events
- Abbruch über die ganze Kette: `AbortController`, `res.on('close')`, `signal` an `fetch`

## Bekannte Lücken

- Der Parser kennt nur den einfachen Fall (ein `data:`-Event pro Block, getrennt mit `\n\n`).
  Im Frontend fehlt noch der Puffer, der unvollständige Events über mehrere Chunks hinweg
  zusammensetzt.
- Keine Eingabevalidierung im Backend und kaum Fehlerbehandlung, etwa wenn Ollama nicht läuft.
- Modell und URL sind nicht konfigurierbar (keine `.env`).
- Quellen zum Nachlesen: siehe `NOTES.md`.

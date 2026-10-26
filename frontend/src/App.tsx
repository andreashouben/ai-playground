import { useRef, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const controllerRef = useRef<AbortController|null>(null);

  async function handleSubmit(event: FormEvent) {
    console.log(event)
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const message: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, message]);
    setInput("");
    controllerRef.current = new AbortController()
    
    

    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, message] }),
      signal: controllerRef.current.signal
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const stream = response!.body!.pipeThrough(new TextDecoderStream());

    const resMessage: Message = {
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, resMessage]);
    for await (const value of stream) {
      const data = value.replace(/^data: /, "");
      resMessage.content += JSON.parse(data).delta ?? "";
      setMessages((prev) => [...prev]);
      
    }

    // TODO: hier POST /chat aufrufen und die Antwort in den State streamen
  }

  function captureKeyDown({key, ctrlKey}: React.KeyboardEvent){
    if(ctrlKey && key==='c' && controllerRef.current !== null){
      controllerRef.current.abort();
    }
  }

  return (
    <main className="chat">
      <ul className="messages">
        {messages.map((message, index) => (
          <li key={index} className={`message ${message.role}`}>
            {message.content}
          </li>
        ))}
      </ul>

      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={input}
          onKeyDown={event => captureKeyDown(event)}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Nachricht eingeben"
        />
        <button type="submit">Senden</button>
      </form>
    </main>
  );
}

export default App;

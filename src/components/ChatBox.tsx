import { useState, FormEvent } from 'react';
import { buildApiUrl, getErrorMessage } from '../api';
import '../styles/chat-box.css';

type Message = {
  id: number;
  sender: 'user' | 'bot';
  text: string;
};

type ChatBoxProps = {
  currentShape: string;
  onResponse: (points: number) => void;
};

const ChatBox = ({ currentShape, onResponse }: ChatBoxProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Pregúntame cómo jugar o pide una pista sobre la figura actual.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('/chat/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensaje: trimmedMessage, figura_actual: currentShape }),
      });

      if (!response.ok) {
        const errorText = await getErrorMessage(response);
        throw new Error(`Error en la consulta del chatbot: ${errorText}`);
      }

      const data = await response.json();
      const botReply = data.respuesta ?? 'El bot no respondió.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botReply,
        },
      ]);
      onResponse(data.puntos_a_sumar_o_restar ?? 0);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`No se pudo conectar con el chatbot. Error: ${errorMessage}. Intenta de nuevo.`);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: 'bot',
          text: 'No pude responder en este momento. Intenta otra vez.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-box">
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div>
          <h3>Asistente de juego</h3>
          <p>Pregunta cómo jugar o pide una pista</p>
        </div>
      </div>

      <div className="chat-container" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'message-row-user' : ''}`}>
            <div className={`message-bubble ${msg.sender === 'user' ? 'message-bubble-user' : 'message-bubble-bot'}`}>
              {msg.sender === 'bot' ? <span className="message-avatar">🤖</span> : null}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading ? <div className="message-row"><div className="message-bubble message-bubble-bot"><p>Escribiendo...</p></div></div> : null}
      </div>

      {error ? <p className="chat-error">{error}</p> : null}

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          id="chat-input"
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Escribe tu pregunta aquí..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '...' : 'Enviar'}
        </button>
      </form>
    </section>
  );
};

export default ChatBox;

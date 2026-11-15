import { useState } from 'react';
import type { FormEvent } from 'react';
import { buildApiUrl, getErrorMessage } from '../api';
import { getUiText } from '../constants';
import type { ChatResponse } from '../types';
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

type ChatMessageListProps = {
  messages: Message[];
  loading: boolean;
  typingText: string;
};

type ChatFormProps = {
  message: string;
  loading: boolean;
  text: ReturnType<typeof getUiText>;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const requestChatResponse = async (
  message: string,
  currentShape: string,
  text: ReturnType<typeof getUiText>,
): Promise<ChatResponse> => {
  const response = await fetch(buildApiUrl('/chat/'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mensaje: message, figura_actual: currentShape }),
  });

  if (!response.ok) {
    const errorText = await getErrorMessage(response);
    throw new Error(text.chatbotRequestError(errorText));
  }

  const data: ChatResponse = await response.json();
  return data;
};

const ChatMessageList = ({ messages, loading, typingText }: ChatMessageListProps) => (
  <div className="chat-container" role="log" aria-live="polite">
    {messages.map((message) => (
      <div
        key={message.id}
        className={`message-row ${message.sender === 'user' ? 'message-row-user' : ''}`}
      >
        <div
          className={`message-bubble ${
            message.sender === 'user' ? 'message-bubble-user' : 'message-bubble-bot'
          }`}
        >
          {message.sender === 'bot' ? <span className="message-avatar">🤖</span> : null}
          <p>{message.text}</p>
        </div>
      </div>
    ))}
    {loading ? (
      <div className="message-row">
        <div className="message-bubble message-bubble-bot">
          <p>{typingText}</p>
        </div>
      </div>
    ) : null}
  </div>
);

const ChatForm = ({ message, loading, text, onMessageChange, onSubmit }: ChatFormProps) => (
  <form onSubmit={onSubmit} className="chat-form">
    <input
      id="chat-input"
      type="text"
      value={message}
      onChange={(event) => onMessageChange(event.target.value)}
      placeholder={text.chatInputPlaceholder}
      disabled={loading}
    />
    <button type="submit" disabled={loading}>
      {loading ? text.chatSending : text.chatSend}
    </button>
  </form>
);

const ChatBox = ({ currentShape, onResponse }: ChatBoxProps) => {
  const text = getUiText();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: text.chatWelcome,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appendMessage = (sender: Message['sender'], text: string, id = Date.now()) => {
    setMessages((previousMessages) => [...previousMessages, { id, sender, text }]);
  };

  const handleRequestError = (error: unknown) => {
    console.error(error);
    const message = error instanceof Error ? error.message : String(error);
    setError(text.chatbotConnectionError(message));
    appendMessage('bot', text.chatbotFallbackReply, Date.now() + 2);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    appendMessage('user', trimmedMessage);
    setMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await requestChatResponse(trimmedMessage, currentShape, text);
      appendMessage('bot', response.respuesta ?? text.chatbotNoReply, Date.now() + 1);
      onResponse(response.puntos_a_sumar_o_restar ?? 0);
    } catch (error) {
      handleRequestError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-box">
      <div className="chat-header">
        <div className="chat-avatar">🤖</div>
        <div>
          <h3>{text.chatTitle}</h3>
          <p>{text.chatDescription}</p>
        </div>
      </div>

      <ChatMessageList messages={messages} loading={loading} typingText={text.chatTyping} />

      {error ? <p className="chat-error">{error}</p> : null}

      <ChatForm
        message={message}
        loading={loading}
        text={text}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default ChatBox;

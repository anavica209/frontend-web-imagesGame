import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getUiText } from '../src/constants';
import ChatBox from '../src/components/ChatBox';
import type { ChatResponse } from '../src/types';

const responseFor = (data: ChatResponse) =>
  new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

const chatResponse: ChatResponse = {
  respuesta: 'It is a circle.',
  puntos_a_sumar_o_restar: 2,
};

const setup = (response?: Response | Promise<Response>) => {
  const fetchMock = vi.fn<typeof fetch>();
  if (response) {
    fetchMock.mockImplementation(() => Promise.resolve(response));
  }
  vi.stubGlobal('fetch', fetchMock);

  const onResponse = vi.fn();
  const user = userEvent.setup();
  const text = getUiText();

  render(<ChatBox currentShape="circle" onResponse={onResponse} />);

  return { fetchMock, onResponse, text, user };
};

const submitQuestion = async (
  user: ReturnType<typeof userEvent.setup>,
  text: ReturnType<typeof getUiText>,
  question = 'Give me a hint',
) => {
  await user.type(screen.getByPlaceholderText(text.chatInputPlaceholder), question);
  await user.click(screen.getByRole('button', { name: text.chatSend }));
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ChatBox', () => {
  it('sends the question and reports points returned by the chatbot', async () => {
    const { fetchMock, onResponse, text, user } = setup(responseFor(chatResponse));
    await submitQuestion(user, text, '  Give me a hint  ');

    expect(await screen.findByText('It is a circle.')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chat/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mensaje: 'Give me a hint', figura_actual: 'circle' }),
      }),
    );
    expect(onResponse).toHaveBeenCalledWith(2);
  });

  it('does not send an empty question', async () => {
    const { fetchMock, text, user } = setup();
    await user.click(screen.getByRole('button', { name: text.chatSend }));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a loading state while waiting for the chatbot response', async () => {
    let resolveResponse!: (response: Response) => void;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const { text, user } = setup(pendingResponse);

    await submitQuestion(user, text);

    expect(screen.getByText(text.chatTyping)).toBeTruthy();
    expect(screen.getByRole('textbox').hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: text.chatSending }).hasAttribute('disabled')).toBe(true);

    resolveResponse(responseFor(chatResponse));
    expect(await screen.findByRole('button', { name: text.chatSend })).toBeTruthy();
    expect(screen.queryByText(text.chatTyping)).toBeNull();
  });

  it('shows an error and fallback reply when the chatbot request fails', async () => {
    const failedResponse = new Response(JSON.stringify({ detail: 'Service unavailable' }), { status: 500 });
    const { onResponse, text, user } = setup(failedResponse);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await submitQuestion(user, text);

    const expectedError = text.chatbotConnectionError(text.chatbotRequestError('Service unavailable'));
    expect(await screen.findByText(expectedError)).toBeTruthy();
    expect(await screen.findByText(text.chatbotFallbackReply)).toBeTruthy();
    expect(onResponse).not.toHaveBeenCalled();
  });
});

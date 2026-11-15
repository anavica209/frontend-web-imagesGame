import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AnswerSubmissionResponse, ChallengeTask } from '../src/types';
import { getUiText } from '../src/constants';
import ImageGenerator from '../src/components/ImageGenerator';

vi.mock('../src/components/ChatBox', () => ({
  default: ({
    onResponse,
  }: {
    onResponse: (response: {
      respuesta: string;
      puntos_a_sumar_o_restar: number;
      scoreTotal?: number;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onResponse({ respuesta: '', puntos_a_sumar_o_restar: 3, scoreTotal: 3 })
      }
    >
      Add chat points
    </button>
  ),
}));

const responseFor = (data: ChallengeTask) =>
  new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

const firstChallenge: ChallengeTask = {
  id: '1',
  imageUrl: '/circle.png',
  options: ['circle', 'square'],
  scoreTotal: 0,
  streak: 2,
};

const nextChallenge: ChallengeTask = {
  id: '2',
  imageUrl: '/square.png',
  options: ['square', 'circle'],
  scoreTotal: 5,
  streak: 3,
};

const answerResponse = (isCorrect: boolean): AnswerSubmissionResponse => ({
  challengeId: '1',
  isCorrect,
  feedback: isCorrect ? 'Correct!' : 'Incorrect answer',
  scoreDelta: isCorrect ? 5 : 0,
  scoreTotal: isCorrect ? 5 : 0,
  streak: isCorrect ? 3 : 0,
  nextChallenge: isCorrect ? nextChallenge : null,
});

const setup = (...responses: Array<Response | Promise<Response>>) => {
  const fetchMock = vi.fn<typeof fetch>();
  responses.forEach((response) => {
    fetchMock.mockImplementationOnce(() => Promise.resolve(response));
  });
  vi.stubGlobal('fetch', fetchMock);

  const user = userEvent.setup();
  const text = getUiText();

  render(<ImageGenerator />);

  return { fetchMock, text, user };
};

const clickOption = async (user: ReturnType<typeof userEvent.setup>, option: string) => {
  await user.click(await screen.findByRole('button', { name: option }));
};

const findChallengeImage = (alt: string) => screen.findByRole('img', { name: alt });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ImageGenerator', () => {
  it('renders the challenge and shows feedback for an incorrect answer', async () => {
    const text = getUiText();
    const { user } = setup(responseFor(firstChallenge), responseFor(answerResponse(false)));

    expect(await findChallengeImage(text.challengeImageAlt)).toBeTruthy();
    expect(await screen.findByText(text.streak(2))).toBeTruthy();
    await clickOption(user, 'Square');

    expect(await screen.findByText('Incorrect answer')).toBeTruthy();
    expect(await screen.findByText(text.streak(0))).toBeTruthy();
    expect((await findChallengeImage(text.challengeImageAlt)).getAttribute('src')).toBe('/circle.png');
  });

  it('awards points and loads the next challenge after a correct answer', async () => {
    const { fetchMock, text, user } = setup(
      responseFor(firstChallenge),
      responseFor(answerResponse(true)),
    );

    await clickOption(user, 'Circle');

    expect(await screen.findByText(text.score(5))).toBeTruthy();
    expect((await findChallengeImage(text.challengeImageAlt)).getAttribute('src')).toBe('/square.png');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/challenges/1/answer/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ answer: 'circle' }),
      }),
    );
  });

  it('shows a loading indicator until the challenge arrives', async () => {
    let resolveResponse!: (response: Response) => void;
    const pendingResponse = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const { text } = setup(pendingResponse);

    expect(screen.getByLabelText(text.loadingChallenge)).toBeTruthy();

    resolveResponse(responseFor(firstChallenge));
    expect(await screen.findByRole('button', { name: 'Circle' })).toBeTruthy();
    expect(screen.queryByLabelText(text.loadingChallenge)).toBeNull();
  });

  it('shows an error and empty state when challenge loading fails', async () => {
    const { text } = setup(new Response('Service unavailable', { status: 500 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await screen.findByText(text.challengeLoadError)).toBeTruthy();
    expect(screen.getByText(text.noChallenge)).toBeTruthy();
  });

  it('adds points received from the chat', async () => {
    const { text, user } = setup(responseFor(firstChallenge));

    await user.click(await screen.findByRole('button', { name: 'Add chat points' }));

    expect(await screen.findByText(text.score(3))).toBeTruthy();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ChallengeTask } from '../src/types';
import { getUiText } from '../src/constants';
import ImageGenerator from '../src/components/ImageGenerator';

vi.mock('../src/components/ChatBox', () => ({
  default: ({ onResponse }: { onResponse: (points: number) => void }) => (
    <button type="button" onClick={() => onResponse(3)}>
      Add chat points
    </button>
  ),
}));

const responseFor = (data: ChallengeTask) =>
  new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });

const firstChallenge: ChallengeTask = {
  id: '1',
  imageUrl: '/circle.png',
  correctAnswer: 'circle',
  options: ['circle', 'square'],
};

const nextChallenge: ChallengeTask = {
  id: '2',
  imageUrl: '/square.png',
  correctAnswer: 'square',
  options: ['square', 'circle'],
};

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
    const { text, user } = setup(responseFor(firstChallenge));

    expect(await findChallengeImage(text.challengeImageAlt)).toBeTruthy();
    await clickOption(user, 'Square');

    expect(await screen.findByText(text.incorrectAnswer)).toBeTruthy();
  });

  it('awards points and loads the next challenge after a correct answer', async () => {
    const { fetchMock, text, user } = setup(responseFor(firstChallenge), responseFor(nextChallenge));

    await clickOption(user, 'Circle');

    expect(await screen.findByText(text.score(5))).toBeTruthy();
    expect((await findChallengeImage(text.challengeImageAlt)).getAttribute('src')).toBe('/square.png');
    expect(fetchMock).toHaveBeenCalledTimes(2);
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

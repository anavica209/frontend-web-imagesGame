import { useCallback, useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import type { ChallengeTask } from '../types';
import { buildApiUrl, getErrorMessage } from '../api';
import { getUiText } from '../constants';
import ChatBox from './ChatBox';
import '../styles/image-generator.css';

type UiText = ReturnType<typeof getUiText>;

const requestChallenge = async (): Promise<ChallengeTask> => {
  const response = await fetch(buildApiUrl('/next-challenge/'));
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const challenge: ChallengeTask = await response.json();
  return challenge;
};

const useChallengeGame = (text: UiText) => {
  const [challenge, setChallenge] = useState<ChallengeTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  const fetchChallenge = useCallback(async () => {
    setLoading(true);
    setFeedback('');

    try {
      setChallenge(await requestChallenge());
    } catch (error) {
      console.error(error);
      setFeedback(text.challengeLoadError);
    } finally {
      setLoading(false);
    }
  }, [text.challengeLoadError]);

  useEffect(() => {
    void fetchChallenge();
  }, [fetchChallenge]);

  const handleAnswer = async (selectedAnswer: string) => {
    if (!challenge) {
      return;
    }

    if (selectedAnswer === challenge.correctAnswer) {
      setPlayerPoints((points) => points + 5);
      setFeedback(text.correctAnswer(5));
      await fetchChallenge();
      return;
    }

    setFeedback(text.incorrectAnswer);
  };

  const handleChatResponse = (pointsDelta: number) => {
    if (pointsDelta !== 0) {
      setPlayerPoints((points) => points + pointsDelta);
    }
  };

  return {
    challenge,
    feedback,
    handleAnswer,
    handleChatResponse,
    loading,
    playerPoints,
  };
};

type ChallengeContentProps = {
  challenge: ChallengeTask | null;
  feedback: string;
  loading: boolean;
  onAnswer: (selectedAnswer: string) => Promise<void>;
  text: UiText;
};

const AnswerOptions = ({
  options,
  onAnswer,
}: {
  options: string[];
  onAnswer: (selectedAnswer: string) => Promise<void>;
}) => (
  <div className="controls-section">
    {options.map((option) => {
      const displayLabel = option.charAt(0).toUpperCase() + option.slice(1);

      return (
        <button key={option} className="option-button" onClick={() => void onAnswer(option)}>
          {displayLabel}
        </button>
      );
    })}
  </div>
);

const ChallengeContent = ({ challenge, feedback, loading, onAnswer, text }: ChallengeContentProps) => (
  <div className="challenge-main">
    <div className="image-section">
      {loading ? (
        <div className="spinner" aria-label={text.loadingChallenge} />
      ) : challenge?.imageUrl ? (
        <img src={challenge.imageUrl} alt={text.challengeImageAlt} className="challenge-image" />
      ) : (
        <p>{text.noChallenge}</p>
      )}
    </div>

    {challenge ? <AnswerOptions options={challenge.options} onAnswer={onAnswer} /> : null}

    {feedback ? <p className="feedback">{feedback}</p> : null}
  </div>
);

const ImageGenerator = () => {
  const text = getUiText();
  const { challenge, feedback, handleAnswer, handleChatResponse, loading, playerPoints } =
    useChallengeGame(text);

  return (
    <div className="app-shell">
      <header className="topbar">
        <img src={logo} alt={text.logoAlt} className="logo" />
      </header>

      <main className="challenge-card">
        <div className="score-row">
          <span>{text.score(playerPoints)}</span>
        </div>

        <div className="challenge-layout">
          <ChallengeContent
            challenge={challenge}
            feedback={feedback}
            loading={loading}
            onAnswer={handleAnswer}
            text={text}
          />
        </div>
      </main>

      {challenge ? (
        <div className="chat-side-panel">
          <ChatBox currentShape={challenge.correctAnswer} onResponse={handleChatResponse} />
        </div>
      ) : null}
    </div>
  );
};

export default ImageGenerator;

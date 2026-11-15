import { useCallback, useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import type { AnswerSubmissionResponse, ChallengeTask, ChatResponse } from '../types';
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

const submitChallengeAnswer = async (
  challengeId: string,
  answer: string,
): Promise<AnswerSubmissionResponse> => {
  const response = await fetch(
    buildApiUrl(`/challenges/${encodeURIComponent(challengeId)}/answer/`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

const useChallengeGame = (text: UiText) => {
  const [challenge, setChallenge] = useState<ChallengeTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const [playerPoints, setPlayerPoints] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);

  const fetchChallenge = useCallback(async () => {
    setLoading(true);
    setFeedback('');

    try {
      const nextChallenge = await requestChallenge();
      setChallenge(nextChallenge);
      setPlayerPoints(nextChallenge.scoreTotal ?? 0);
      setStreakCount(nextChallenge.streak ?? 0);
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
    if (!challenge || submittingAnswer) {
      return;
    }

    setSubmittingAnswer(true);
    setFeedback('');

    try {
      const result = await submitChallengeAnswer(challenge.id, selectedAnswer);
      setPlayerPoints(result.scoreTotal);
      setStreakCount(result.streak);
      setFeedback(result.feedback);

      if (result.isCorrect) {
        setChallenge(result.nextChallenge);
      }
    } catch (error) {
      console.error(error);
      setFeedback(text.answerRequestError);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleChatResponse = (response: ChatResponse) => {
    if (response.scoreTotal !== undefined) {
      setPlayerPoints(response.scoreTotal);
    }

    if (response.streak !== undefined) {
      setStreakCount(response.streak);
    }
  };

  return {
    challenge,
    feedback,
    handleAnswer,
    handleChatResponse,
    loading,
    playerPoints,
    streakCount,
    submittingAnswer,
  };
};

type ChallengeContentProps = {
  challenge: ChallengeTask | null;
  loading: boolean;
  text: UiText;
};

const AnswerOptions = ({
  options,
  onAnswer,
  disabled,
}: {
  options: string[];
  onAnswer: (selectedAnswer: string) => Promise<void>;
  disabled: boolean;
}) => (
  <div className="controls-section">
    {options.map((option) => {
      const displayLabel = option.charAt(0).toUpperCase() + option.slice(1);

      return (
        <button
          key={option}
          className="option-button"
          disabled={disabled}
          onClick={() => void onAnswer(option)}
        >
          {displayLabel}
        </button>
      );
    })}
  </div>
);

const ChallengeContent = ({
  challenge,
  loading,
  text,
}: ChallengeContentProps) => (
  <>
    <div className="image-section">
      <div className="image-viewport">
        {loading ? (
          <div className="spinner" aria-label={text.loadingChallenge} />
        ) : challenge?.imageUrl ? (
          <img
            src={challenge.imageUrl}
            alt={text.challengeImageAlt}
            className="challenge-image"
          />
        ) : (
          <p>{text.noChallenge}</p>
        )}
      </div>
    </div>
  </>
);

const ImageGenerator = () => {
  const text = getUiText();
  const {
    challenge,
    feedback,
    handleAnswer,
    handleChatResponse,
    loading,
    playerPoints,
    streakCount,
    submittingAnswer,
  } = useChallengeGame(text);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src={logo} alt={text.logoAlt} className="logo" />
          <div>
            <h1>{text.appName}</h1>
            <p>{text.appTagline}</p>
          </div>
        </div>
        <div className="header-metrics">
          {challenge && (
            <span className="metric-badge streak-badge">
              <span aria-hidden="true">🔥 </span>
              <span>{text.streak(streakCount)}</span>
            </span>
          )}
          <span className="metric-badge score-badge">
            <span aria-hidden="true">🏆 </span>
            <span>{text.score(playerPoints)}</span>
          </span>
        </div>
      </header>

      <main className="game-layout">
        <section className="image-panel">
          <div className="image-panel-heading">
            <span className="eyebrow">{text.appName}</span>
            <h2>{text.questionTitle}</h2>
          </div>
          <ChallengeContent
            challenge={challenge}
            loading={loading}
            text={text}
          />
        </section>

        <aside className="game-sidebar">
          <div className="sidebar-heading">
            <span className="eyebrow">{text.answersTitle}</span>
          </div>
          {challenge ? (
            <ChatBox
              key={challenge.id}
              challengeId={challenge.id}
              onResponse={handleChatResponse}
            />
          ) : loading ? (
            <div className="chat-placeholder">{text.loadingChallenge}</div>
          ) : null}
          {challenge ? (
            <AnswerOptions
              options={challenge.options}
              onAnswer={handleAnswer}
              disabled={submittingAnswer}
            />
          ) : null}
          {feedback ? <p className="feedback" role="status">{feedback}</p> : null}
        </aside>
      </main>
    </div>
  );
};

export default ImageGenerator;

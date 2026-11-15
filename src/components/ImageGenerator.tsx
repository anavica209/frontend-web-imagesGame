import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import type { ChallengeTask } from '../types';
import { buildApiUrl, getErrorMessage } from '../api';
import ChatBox from './ChatBox';
import '../styles/image-generator.css';

const ImageGenerator = () => {
  const [challenge, setChallenge] = useState<ChallengeTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');
  const [playerPoints, setPlayerPoints] = useState<number>(0);

  const fetchChallenge = async () => {
    setLoading(true);
    setFeedback('');

    try {
      const response = await fetch(buildApiUrl('/next-challenge/'));
      if (!response.ok) {
        const errorText = await getErrorMessage(response);
        throw new Error(errorText);
      }
      const data: ChallengeTask = await response.json();
      setChallenge(data);
    } catch (error) {
      console.error(error);
      setFeedback('Error loading challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchChallenge();
  }, []);

  const handleAnswer = async (selectedAnswer: string) => {
    if (!challenge) {
      return;
    }

    if (selectedAnswer === challenge.correctAnswer) {
      setPlayerPoints((points) => points + 5);
      setFeedback('¡Correcto! Has ganado 5 puntos. Cargando próximo desafío...');
      await fetchChallenge();
      return;
    }

    setFeedback('No es correcto. Intenta otra opción.');
  };

  const handleChatResponse = (pointsDelta: number) => {
    if (pointsDelta !== 0) {
      setPlayerPoints((points) => points + pointsDelta);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <img src={logo} alt="App logo" className="logo" />
      </header>

      <main className="challenge-card">
        <div className="score-row">
          <span>Puntos: {playerPoints}</span>
        </div>

        <div className="challenge-layout">
          <div className="challenge-main">
            <div className="image-section">
              {loading ? (
                <div className="spinner" aria-label="Loading challenge" />
              ) : challenge?.imageUrl ? (
                <img src={challenge.imageUrl} alt="Generated geometry challenge" className="challenge-image" />
              ) : (
                <p>No challenge available.</p>
              )}
            </div>

            <div className="controls-section">
              {challenge?.options.map((option) => {
                const displayLabel = option.charAt(0).toUpperCase() + option.slice(1);

                return (
                  <button key={option} className="option-button" onClick={() => void handleAnswer(option)}>
                    {displayLabel}
                  </button>
                );
              })}
            </div>

            {feedback ? <p className="feedback">{feedback}</p> : null}
          </div>
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

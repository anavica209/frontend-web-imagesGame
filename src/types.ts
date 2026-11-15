export interface ChallengeTask {
  id: string;
  imageUrl: string;
  options: string[];
  scoreTotal?: number;
  streak?: number;
}

export interface AnswerSubmissionResponse {
  challengeId: string;
  isCorrect: boolean;
  feedback: string;
  scoreDelta: number;
  scoreTotal: number;
  streak: number;
  nextChallenge: ChallengeTask | null;
}

export interface ChatResponse {
  respuesta: string;
  puntos_a_sumar_o_restar: number;
  scoreTotal?: number;
  streak?: number;
}

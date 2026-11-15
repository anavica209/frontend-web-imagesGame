export interface ChallengeTask {
  id: string;
  imageUrl: string;
  correctAnswer: string;
  options: string[];
}

export interface ChatResponse {
  respuesta: string;
  puntos_a_sumar_o_restar: number;
}

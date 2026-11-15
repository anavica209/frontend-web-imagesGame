const UI_TEXT = {
  en: {
    unexpectedServerResponse: 'Unexpected response from the server.',
    challengeLoadError: 'Error loading challenge. Please try again.',
    answerRequestError: 'Error submitting your answer. Please try again.',
    logoAlt: 'App logo',
    score: (points: number) => `Points: ${points}`,
    streak: (count: number) => `Streak: ${count}`,
    appName: 'Zaino',
    appTagline: 'Visual challenge',
    questionTitle: 'What shape is hidden?',
    answersTitle: 'Choose your answer',
    loadingChallenge: 'Loading challenge',
    challengeImageAlt: 'Generated geometry challenge',
    noChallenge: 'No challenge available.',
    chatWelcome: 'Hello! Ask me how to play or request a hint about the current shape.',
    chatbotRequestError: (error: string) => `Error querying the chatbot: ${error}`,
    chatbotNoReply: 'The bot did not respond.',
    chatbotConnectionError: (error: string) =>
      `Could not connect to the chatbot. Error: ${error}. Please try again.`,
    chatbotFallbackReply: 'I could not respond right now. Please try again.',
    chatTitle: 'Game assistant',
    chatDescription: 'Ask how to play or request a hint',
    chatTyping: 'Typing...',
    chatInputPlaceholder: 'Type your question here...',
    chatSend: 'Send',
    chatSending: 'Sending...',
  },
  es: {
    unexpectedServerResponse: 'Respuesta inesperada del servidor.',
    challengeLoadError: 'Error al cargar el desafío. Inténtalo de nuevo.',
    answerRequestError: 'Error al enviar tu respuesta. Inténtalo de nuevo.',
    logoAlt: 'Logo de la aplicación',
    score: (points: number) => `Puntos: ${points}`,
    streak: (count: number) => `Racha: ${count}`,
    appName: 'Zaino',
    appTagline: 'Desafío visual',
    questionTitle: '¿Qué figura se esconde?',
    answersTitle: 'Elige una respuesta',
    loadingChallenge: 'Cargando desafío',
    challengeImageAlt: 'Desafío de geometría generado',
    noChallenge: 'No hay ningún desafío disponible.',
    chatWelcome: '¡Hola! Pregúntame cómo jugar o pide una pista sobre la figura actual.',
    chatbotRequestError: (error: string) => `Error en la consulta del chatbot: ${error}`,
    chatbotNoReply: 'El bot no respondió.',
    chatbotConnectionError: (error: string) =>
      `No se pudo conectar con el chatbot. Error: ${error}. Intenta de nuevo.`,
    chatbotFallbackReply: 'No pude responder en este momento. Intenta otra vez.',
    chatTitle: 'Asistente de juego',
    chatDescription: 'Pregunta cómo jugar o pide una pista',
    chatTyping: 'Escribiendo...',
    chatInputPlaceholder: 'Escribe tu pregunta aquí...',
    chatSend: 'Enviar',
    chatSending: 'Enviando...',
  },
} as const;

export const getUiText = () => {
  const language = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')
    ? 'en'
    : 'es';

  return UI_TEXT[language];
};

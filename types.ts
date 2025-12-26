
export enum GameState {
  WELCOME = 'WELCOME',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export enum GameMode {
  CLASSIC_12 = 'CLASSIC_12',    // The 12s
  ESTIMATION = 'ESTIMATION',    // Division (nearest whole)
  PROPORTION = 'PROPORTION',    // Percentage
  COMPOUND = 'COMPOUND',         // 1-digit x 2-digit
  RECIPROCAL = 'RECIPROCAL',     // 1/a
  GROWTH = 'GROWTH',             // Growth % from A to B
  BIG_PERCENT = 'BIG_PERCENT',   // a% of big b
  CLEAN_DIVISION = 'CLEAN_DIVISION' // a / b = whole
}

export interface Question {
  id: number;
  a: number; 
  b: number;
  mode: GameMode;
  label: string; // The formatted string of the question (e.g., "3 of 17" or "12 x 12")
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timestamp: number;
  timeTaken: number; // Time in milliseconds
}

export interface GameStats {
  mode: GameMode;
  score: number;
  totalQuestions: number;
  lives: number;
  history: Question[];
}

export const MAX_LIVES = 3;
export const TOTAL_QUESTIONS = 15;

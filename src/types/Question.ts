import React from 'react';

export interface BaseQuestion {
  id: string;
  type: 'multiple-choice' | 'select-all' | 'true-false' | 'flashcard' | 'fact-card' | 'matching';
  subject: string;
  topic: string; // Specific topic within the chapter/subject
  chapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  image?: string; // URL or base64 encoded image
  imageAlt?: string; // Alt text for accessibility
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface SelectAllQuestion extends BaseQuestion {
  type: 'select-all';
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  question: string;
  options: string[]; // Will be ["True", "False"]
  correctAnswer: number; // 0 for True, 1 for False
  explanation?: string;
}

export interface FlashcardQuestion extends BaseQuestion {
  type: 'flashcard';
  front: string;
  back: string;
  hint?: string;
  frontImage?: string; // Image for front of card
  frontImageAlt?: string;
  backImage?: string; // Image for back of card
  backImageAlt?: string;
}

export interface FactCardQuestion extends BaseQuestion {
  type: 'fact-card';
  fact: string;
  title?: string; // Optional title for the fact
  source?: string; // Optional source attribution
  factImage?: string; // Image to accompany the fact
  factImageAlt?: string;
}

export interface MatchingPair {
  term: string;
  definition: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  instruction: string; // Instructions for the matching exercise
  pairs: MatchingPair[];
  explanation?: string;
}

export type Question = MultipleChoiceQuestion | SelectAllQuestion | TrueFalseQuestion | FlashcardQuestion | FactCardQuestion | MatchingQuestion;

export interface QuestionSet {
  name: string;
  description?: string;
  subject: string;
  questions: Question[];
}

export interface QuizSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  answers: Record<string, any>;
  score?: number;
  completed: boolean;
}

export interface StudyProgress {
  questionId: string;
  correctCount: number;
  incorrectCount: number;
  lastAnswered: Date;
  nextReview: Date;
  easeFactor: number;
}

export interface SpacedRepetitionSettings {
  firstReviewHours: number;      // Hours after first correct answer (default: 24)
  secondReviewHours: number;     // Hours after second correct answer (default: 144 = 6 days)
  incorrectReviewHours: number;  // Hours after incorrect answer (default: 1)
  minEaseFactor: number;         // Minimum ease factor (default: 1.3)
  easeFactorIncrement: number;   // Ease factor increase for correct answers (default: 0.1)
  easeFactorDecrement: number;   // Ease factor decrease for incorrect answers (default: 0.2)
  masteryThreshold: number;      // Number of consecutive correct answers for mastery (default: 3)
}
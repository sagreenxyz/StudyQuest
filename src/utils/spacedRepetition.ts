import { StudyProgress, SpacedRepetitionSettings } from '../types/Question';

// Default spaced repetition settings
export const defaultSpacedRepetitionSettings: SpacedRepetitionSettings = {
  firstReviewHours: 24,
  secondReviewHours: 144, // 6 days
  incorrectReviewHours: 1,
  minEaseFactor: 1.3,
  easeFactorIncrement: 0.1,
  easeFactorDecrement: 0.2,
  masteryThreshold: 3
};

// Spaced repetition algorithm based on SM-2 with configurable settings
export function calculateNextReview(
  progress: StudyProgress,
  isCorrect: boolean,
  settings: SpacedRepetitionSettings = defaultSpacedRepetitionSettings
): StudyProgress {
  const now = new Date();
  let { easeFactor, correctCount, incorrectCount } = progress;

  if (isCorrect) {
    correctCount++;
    if (correctCount === 1) {
      // First correct answer - use configured first review time
      return {
        ...progress,
        correctCount,
        lastAnswered: now,
        nextReview: new Date(now.getTime() + settings.firstReviewHours * 60 * 60 * 1000),
      };
    } else if (correctCount === 2) {
      // Second correct answer - use configured second review time
      return {
        ...progress,
        correctCount,
        lastAnswered: now,
        nextReview: new Date(now.getTime() + settings.secondReviewHours * 60 * 60 * 1000),
      };
    } else {
      // Subsequent correct answers - use ease factor
      const interval = Math.ceil((correctCount - 1) * easeFactor);
      return {
        ...progress,
        correctCount,
        lastAnswered: now,
        nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
        easeFactor: Math.max(settings.minEaseFactor, easeFactor + settings.easeFactorIncrement),
      };
    }
  } else {
    // Incorrect answer - reset and review sooner using configured time
    return {
      ...progress,
      correctCount: 0,
      incorrectCount: incorrectCount + 1,
      lastAnswered: now,
      nextReview: new Date(now.getTime() + settings.incorrectReviewHours * 60 * 60 * 1000),
      easeFactor: Math.max(settings.minEaseFactor, easeFactor - settings.easeFactorDecrement),
    };
  }
}

export function getQuestionsForReview(
  allProgress: StudyProgress[]
): string[] {
  const now = new Date();
  const dueQuestions = allProgress
    .filter(progress => progress.nextReview <= now)
    .sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime())
    .map(progress => progress.questionId);

  return dueQuestions;
}

// Helper function to check if a question is mastered based on settings
export function isQuestionMastered(
  progress: StudyProgress,
  settings: SpacedRepetitionSettings = defaultSpacedRepetitionSettings
): boolean {
  return progress.correctCount >= settings.masteryThreshold;
}
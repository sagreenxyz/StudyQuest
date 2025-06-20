import React, { useState, useEffect } from 'react';
import { Question } from '../types/Question';
import { QuestionCard } from './QuestionCard';
import { ArrowRight, RotateCcw, Home } from 'lucide-react';

interface QuizModeProps {
  questions: Question[];
  onComplete: (results: QuizResults) => void;
  onExit: () => void;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    userAnswer: any;
    timeSpent: number;
  }>;
}

export function QuizMode({ questions, onComplete, onExit }: QuizModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const userAnswer = userAnswers[currentQuestion?.id];

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const checkAnswer = (question: Question, answer: any): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        return answer === (question as any).correctAnswer;
      case 'select-all':
        const correctAnswers = (question as any).correctAnswers;
        return Array.isArray(answer) && 
               answer.length === correctAnswers.length &&
               answer.every(a => correctAnswers.includes(a));
      case 'true-false':
        return answer === (question as any).correctAnswer;
      case 'flashcard':
        return answer === true; // For flashcards, true means "easy"
      case 'fact-card':
        return true; // Fact cards are always "correct" since they're informational
      case 'matching':
        const pairs = (question as any).pairs;
        if (!answer || typeof answer !== 'object') return false;
        
        // Check if all pairs are correctly matched
        for (let i = 0; i < pairs.length; i++) {
          if (answer[i] !== i) return false;
        }
        return Object.keys(answer).length === pairs.length;
      default:
        return false;
    }
  };

  const handleAnswer = (answer: any) => {
    const questionTime = Date.now() - questionStartTime;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion.id]: questionTime
    }));
    
    // For fact cards, automatically move to next question after a short delay
    if (currentQuestion.type === 'fact-card') {
      setTimeout(() => {
        if (isLastQuestion) {
          completeQuiz();
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 1000);
    } else {
      setShowResult(true);
    }
  };

  const completeQuiz = () => {
    const totalTime = Date.now() - startTime;
    const questionResults = questions.map(q => ({
      questionId: q.id,
      isCorrect: checkAnswer(q, userAnswers[q.id]),
      userAnswer: userAnswers[q.id],
      timeSpent: questionTimes[q.id] || 0
    }));
    
    const correctAnswers = questionResults.filter(r => r.isCorrect).length;
    
    onComplete({
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent: totalTime,
      questionResults
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      completeQuiz();
    } else {
      setCurrentIndex(prev => prev + 1);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setShowResult(false);
    setQuestionTimes({});
    setQuestionStartTime(Date.now());
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No questions available</p>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        showResult={showResult}
        userAnswer={userAnswer}
        isCorrect={checkAnswer(currentQuestion, userAnswer)}
      />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-3">
          <button
            onClick={onExit}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Exit Quiz
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </button>
        </div>

        {(showResult || currentQuestion.type === 'fact-card') && (
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
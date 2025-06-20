import React, { useState } from 'react';
import { Question, QuestionSet, StudyProgress, SpacedRepetitionSettings } from './types/Question';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateNextReview, getQuestionsForReview, defaultSpacedRepetitionSettings } from './utils/spacedRepetition';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { QuizMode, QuizResults as QuizResultsType } from './components/QuizMode';
import { QuizResults } from './components/QuizResults';
import { BookOpen, Upload, Home } from 'lucide-react';

type AppMode = 'home' | 'quiz' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [questions, setQuestions] = useLocalStorage<Question[]>('studyquest-questions', []);
  const [progress, setProgress] = useLocalStorage<StudyProgress[]>('studyquest-progress', []);
  const [spacedRepetitionSettings, setSpacedRepetitionSettings] = useLocalStorage<SpacedRepetitionSettings>(
    'studyquest-spaced-settings', 
    defaultSpacedRepetitionSettings
  );
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultsType | null>(null);

  const handleUpload = (questionSets: QuestionSet[]) => {
    // Process all question sets
    const allNewQuestions: Question[] = [];
    
    questionSets.forEach(questionSet => {
      const newQuestions = questionSet.questions.map(q => ({
        ...q,
        id: q.id || `${Date.now()}-${Math.random()}`
      }));
      allNewQuestions.push(...newQuestions);
    });
    
    setQuestions(prev => [...prev, ...allNewQuestions]);
    
    // Initialize progress for all new questions
    const newProgress = allNewQuestions.map(q => ({
      questionId: q.id,
      correctCount: 0,
      incorrectCount: 0,
      lastAnswered: new Date(),
      nextReview: new Date(),
      easeFactor: 2.5
    }));
    
    setProgress(prev => [...prev, ...newProgress]);
  };

  const handleStartQuiz = (quizQuestions: Question[]) => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setCurrentQuizQuestions(shuffled);
    setMode('quiz');
  };

  const handleStartReview = () => {
    const dueQuestionIds = getQuestionsForReview(progress);
    const reviewQuestions = questions.filter(q => dueQuestionIds.includes(q.id));
    handleStartQuiz(reviewQuestions);
  };

  const handleClearData = () => {
    setQuestions([]);
    setProgress([]);
    setMode('home');
    setCurrentQuizQuestions([]);
    setQuizResults(null);
  };

  const handleQuizComplete = (results: QuizResultsType) => {
    setQuizResults(results);
    
    // Update progress for each question using current settings
    const updatedProgress = [...progress];
    
    results.questionResults.forEach(result => {
      const existingProgressIndex = updatedProgress.findIndex(p => p.questionId === result.questionId);
      
      if (existingProgressIndex >= 0) {
        updatedProgress[existingProgressIndex] = calculateNextReview(
          updatedProgress[existingProgressIndex],
          result.isCorrect,
          spacedRepetitionSettings
        );
      } else {
        // Create new progress entry
        const newProgress = calculateNextReview(
          {
            questionId: result.questionId,
            correctCount: 0,
            incorrectCount: 0,
            lastAnswered: new Date(),
            nextReview: new Date(),
            easeFactor: 2.5
          },
          result.isCorrect,
          spacedRepetitionSettings
        );
        updatedProgress.push(newProgress);
      }
    });
    
    setProgress(updatedProgress);
    setMode('results');
  };

  const handleRetakeQuiz = () => {
    setMode('quiz');
  };

  const handleHome = () => {
    setMode('home');
    setCurrentQuizQuestions([]);
    setQuizResults(null);
  };

  // Get existing question IDs for duplicate checking
  const existingQuestionIds = questions.map(q => q.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">StudyQuest</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              {mode !== 'home' && (
                <button
                  onClick={handleHome}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </button>
              )}
              <div className="text-sm text-gray-500">
                {questions.length} questions loaded
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'home' && (
          <div className="space-y-8">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to StudyQuest</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Get started by uploading your first question set. Upload JSON files containing 
                  multiple-choice questions, select-all questions, and flashcards.
                </p>
                <div className="max-w-md mx-auto">
                  <FileUpload onUpload={handleUpload} existingQuestionIds={existingQuestionIds} />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Study Dashboard</h2>
                  <FileUpload 
                    onUpload={handleUpload} 
                    existingQuestionIds={existingQuestionIds}
                    className="max-w-xs" 
                  />
                </div>
                <Dashboard
                  questions={questions}
                  progress={progress}
                  spacedRepetitionSettings={spacedRepetitionSettings}
                  onStartQuiz={handleStartQuiz}
                  onStartReview={handleStartReview}
                  onClearData={handleClearData}
                  onUpdateSpacedRepetitionSettings={setSpacedRepetitionSettings}
                />
              </>
            )}
          </div>
        )}

        {mode === 'quiz' && (
          <QuizMode
            questions={currentQuizQuestions}
            onComplete={handleQuizComplete}
            onExit={handleHome}
          />
        )}

        {mode === 'results' && quizResults && (
          <QuizResults
            results={quizResults}
            onHome={handleHome}
            onRetake={handleRetakeQuiz}
          />
        )}
      </main>
    </div>
  );
}

export default App;
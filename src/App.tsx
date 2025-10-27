import React, { useState, useEffect } from 'react';
import { Question, StudyProgress, SpacedRepetitionSettings } from './types/Question';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateNextReview, getQuestionsForReview, defaultSpacedRepetitionSettings } from './utils/spacedRepetition';
import { Dashboard } from './components/Dashboard';
import { QuizMode, QuizResults as QuizResultsType } from './components/QuizMode';
import { QuizResults } from './components/QuizResults';
import { questionService, QuestionIndex } from './services/QuestionService';
import { BookOpen, Home, Loader } from 'lucide-react';

type AppMode = 'loading' | 'home' | 'quiz' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('loading');
  const [questionIndex, setQuestionIndex] = useLocalStorage<QuestionIndex>('studyquest-index', {
    questions: [],
    lastUpdated: new Date()
  });
  const [progress, setProgress] = useLocalStorage<StudyProgress[]>('studyquest-progress', []);
  const [spacedRepetitionSettings, setSpacedRepetitionSettings] = useLocalStorage<SpacedRepetitionSettings>(
    'studyquest-spaced-settings',
    defaultSpacedRepetitionSettings
  );
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultsType | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [hasLoadedIndex, setHasLoadedIndex] = useLocalStorage<boolean>('studyquest-index-loaded', false);

  // Auto-load question index on startup
  useEffect(() => {
    const loadQuestionIndex = async () => {
      try {
        console.log('Building question index...');
        const index = await questionService.buildQuestionIndex();

        if (index.questions.length === 0) {
          setLoadingError('No question files found in the public/questions directory.');
          setMode('home');
          return;
        }

        console.log(`Question index built: ${index.questions.length} questions from ${new Set(index.questions.map(q => q.sourceFile)).size} files`);
        setQuestionIndex(index);

        // Clean up progress - only keep progress for questions that actually exist
        const validQuestionIds = index.questions.map(q => q.id);
        const cleanedProgress = progress.filter(p => validQuestionIds.includes(p.questionId));

        if (cleanedProgress.length !== progress.length) {
          console.log(`Cleaned up progress: ${progress.length} -> ${cleanedProgress.length} entries`);
          setProgress(cleanedProgress);
        }

        setHasLoadedIndex(true);
        setMode('home');

      } catch (error) {
        console.error('Error building question index:', error);
        setLoadingError(`Failed to build question index: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMode('home');
      }
    };

    // Load index if we haven't loaded it before or if we have no questions in the index
    if (!hasLoadedIndex || questionIndex.questions.length === 0) {
      loadQuestionIndex();
    } else {
      setMode('home');
    }
  }, []);

  // Clean up progress when index changes to ensure consistency
  useEffect(() => {
    if (questionIndex.questions.length > 0) {
      const validQuestionIds = questionIndex.questions.map(q => q.id);
      const cleanedProgress = progress.filter(p => validQuestionIds.includes(p.questionId));

      // Only update if there's a mismatch
      if (cleanedProgress.length !== progress.length) {
        console.log(`Cleaning up progress: ${progress.length} -> ${cleanedProgress.length} entries`);
        setProgress(cleanedProgress);
      }
    }
  }, [questionIndex]);

  const handleStartQuiz = async (questionIds: string[]) => {
    try {
      setMode('loading');
      console.log(`Loading ${questionIds.length} questions for quiz...`);

      const questions = await questionService.loadQuestions(questionIds, questionIndex);

      // Initialize progress for any new questions
      const existingProgressIds = progress.map(p => p.questionId);
      const newProgressEntries = questions
        .filter(q => !existingProgressIds.includes(q.id))
        .map(q => ({
          questionId: q.id,
          correctCount: 0,
          incorrectCount: 0,
          lastAnswered: new Date(),
          nextReview: new Date(),
          easeFactor: 2.5
        }));

      if (newProgressEntries.length > 0) {
        setProgress([...progress, ...newProgressEntries]);
      }

      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setCurrentQuizQuestions(shuffled);
      setMode('quiz');
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      alert(`Failed to load questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMode('home');
    }
  };

  const handleStartReview = () => {
    const dueQuestionIds = getQuestionsForReview(progress);
    if (dueQuestionIds.length === 0) {
      alert('No questions are due for review!');
      return;
    }
    handleStartQuiz(dueQuestionIds);
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

  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading StudyQuest</h2>
            <p className="text-gray-600">Loading questions...</p>
            <p className="text-gray-500 text-sm mt-2">Files starting with "." are ignored</p>
          </div>
        </div>
      </div>
    );
  }

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
                {questionIndex.questions.length} questions available
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'home' && (
          <div className="space-y-8">
            {questionIndex.questions.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
                <div className="max-w-md mx-auto space-y-4">
                  <p className="text-gray-600">
                    StudyQuest loads questions from the <code className="bg-gray-200 px-2 py-1 rounded text-sm">public/questions/</code> directory.
                  </p>
                  {loadingError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 text-sm font-medium mb-2">Loading Error:</p>
                      <p className="text-red-700 text-sm whitespace-pre-line">{loadingError}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h3 className="text-blue-900 font-medium mb-2">To add questions:</h3>
                    <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                      <li>Place JSON question files in <code className="bg-blue-200 px-1 rounded">public/questions/</code></li>
                      <li>Files can be in subdirectories for organization</li>
                      <li>Files and folders starting with "." are ignored</li>
                      <li>Refresh the page to load new files</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Study Dashboard</h2>
                </div>
                <Dashboard
                  questionIndex={questionIndex}
                  progress={progress}
                  spacedRepetitionSettings={spacedRepetitionSettings}
                  onStartQuiz={handleStartQuiz}
                  onStartReview={handleStartReview}
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

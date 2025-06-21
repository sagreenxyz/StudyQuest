import React, { useState, useEffect } from 'react';
import { Question, QuestionSet, StudyProgress, SpacedRepetitionSettings } from './types/Question';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateNextReview, getQuestionsForReview, defaultSpacedRepetitionSettings } from './utils/spacedRepetition';
import { ProjectFileLoader } from './components/ProjectFileLoader';
import { Dashboard } from './components/Dashboard';
import { QuizMode, QuizResults as QuizResultsType } from './components/QuizMode';
import { QuizResults } from './components/QuizResults';
import { BookOpen, Home, Loader } from 'lucide-react';

type AppMode = 'loading' | 'home' | 'quiz' | 'results';

function App() {
  const [mode, setMode] = useState<AppMode>('loading');
  const [questions, setQuestions] = useLocalStorage<Question[]>('studyquest-questions', []);
  const [progress, setProgress] = useLocalStorage<StudyProgress[]>('studyquest-progress', []);
  const [spacedRepetitionSettings, setSpacedRepetitionSettings] = useLocalStorage<SpacedRepetitionSettings>(
    'studyquest-spaced-settings', 
    defaultSpacedRepetitionSettings
  );
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultsType | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Auto-load project files on startup
  useEffect(() => {
    const loadProjectFiles = async () => {
      try {
        // Use Vite's import.meta.glob to find all .json files recursively
        const questionModules = import.meta.glob('/public/questions/**/*.json');
        
        if (Object.keys(questionModules).length === 0) {
          setLoadingError('No question files found in the public/questions directory.');
          setMode('home');
          return;
        }

        const allNewQuestions: Question[] = [];
        const errorMessages: string[] = [];
        const existingQuestionIds = questions.map(q => q.id);
        let duplicateIds: string[] = [];
        let skippedQuestions = 0;

        for (const [path, moduleLoader] of Object.entries(questionModules)) {
          try {
            const filename = path.replace('/public/questions/', '');
            const fetchPath = `/StudyQuest/questions/${filename}`;
            
            const response = await fetch(fetchPath);
            if (!response.ok) {
              throw new Error(`Failed to fetch file: ${response.statusText}`);
            }

            const questionSet: QuestionSet = await response.json();

            // Validate the structure
            if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
              throw new Error(`Invalid question set format in file: ${filename}`);
            }

            // Track duplicates and filter them out
            const filteredQuestions: typeof questionSet.questions = [];

            questionSet.questions.forEach((question, qIndex) => {
              if (!question.id || !question.type || !question.subject || !question.topic) {
                throw new Error(`Question ${qIndex + 1} in file "${filename}" is missing required fields (id, type, subject, topic)`);
              }

              // Check for duplicate IDs
              if (existingQuestionIds.includes(question.id) || allNewQuestions.some(q => q.id === question.id)) {
                duplicateIds.push(question.id);
                skippedQuestions++;
                return; // Skip this question
              }

              // Validate question type specific fields
              if (question.type === 'multiple-choice') {
                const mcq = question as any;
                if (!mcq.question || !mcq.options || typeof mcq.correctAnswer !== 'number') {
                  throw new Error(`Multiple choice question ${qIndex + 1} in file "${filename}" is missing required fields`);
                }
              } else if (question.type === 'select-all') {
                const saq = question as any;
                if (!saq.question || !saq.options || !Array.isArray(saq.correctAnswers)) {
                  throw new Error(`Select-all question ${qIndex + 1} in file "${filename}" is missing required fields`);
                }
              } else if (question.type === 'true-false') {
                const tfq = question as any;
                if (!tfq.question || !tfq.options || typeof tfq.correctAnswer !== 'number') {
                  throw new Error(`True-false question ${qIndex + 1} in file "${filename}" is missing required fields`);
                }
                if (!Array.isArray(tfq.options) || tfq.options.length !== 2 || 
                    tfq.options[0] !== "True" || tfq.options[1] !== "False") {
                  throw new Error(`True-false question ${qIndex + 1} in file "${filename}" must have options ["True", "False"]`);
                }
                if (tfq.correctAnswer !== 0 && tfq.correctAnswer !== 1) {
                  throw new Error(`True-false question ${qIndex + 1} in file "${filename}" must have correctAnswer 0 (True) or 1 (False)`);
                }
              } else if (question.type === 'flashcard') {
                const fcq = question as any;
                if (!fcq.front || !fcq.back) {
                  throw new Error(`Flashcard ${qIndex + 1} in file "${filename}" is missing required fields (front, back)`);
                }
              } else if (question.type === 'fact-card') {
                const factq = question as any;
                if (!factq.fact) {
                  throw new Error(`Fact card ${qIndex + 1} in file "${filename}" is missing required field (fact)`);
                }
              } else if (question.type === 'matching') {
                const matchq = question as any;
                if (!matchq.instruction || !matchq.pairs || !Array.isArray(matchq.pairs)) {
                  throw new Error(`Matching question ${qIndex + 1} in file "${filename}" is missing required fields (instruction, pairs)`);
                }
                matchq.pairs.forEach((pair: any, pairIndex: number) => {
                  if (!pair.term || !pair.definition) {
                    throw new Error(`Matching question ${qIndex + 1}, pair ${pairIndex + 1} in file "${filename}" is missing term or definition`);
                  }
                });
              }

              // Add sourceFile to track which file this question came from
              question.sourceFile = filename;

              // Add to filtered questions if it passes all validations
              filteredQuestions.push(question);
            });

            // Add questions to the collection
            allNewQuestions.push(...filteredQuestions);

          } catch (error) {
            const errorMessage = `Error in file "${path}": ${error instanceof Error ? error.message : 'Please check the file format.'}`;
            errorMessages.push(errorMessage);
            console.error(`File parsing error for ${path}:`, error);
          }
        }

        // Only update questions if we have new ones and no existing questions
        if (allNewQuestions.length > 0 && questions.length === 0) {
          setQuestions(allNewQuestions);
          
          // Initialize progress for all new questions
          const newProgress = allNewQuestions.map(q => ({
            questionId: q.id,
            correctCount: 0,
            incorrectCount: 0,
            lastAnswered: new Date(),
            nextReview: new Date(),
            easeFactor: 2.5
          }));
          
          setProgress(newProgress);
        }

        if (errorMessages.length > 0) {
          setLoadingError(`Errors loading some files:\n${errorMessages.join('\n')}`);
        }

        setMode('home');

      } catch (error) {
        console.error('Error loading project files:', error);
        setLoadingError(`Failed to load project files: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setMode('home');
      }
    };

    // Only auto-load if we don't have questions already
    if (questions.length === 0) {
      loadProjectFiles();
    } else {
      setMode('home');
    }
  }, []);

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
            <p className="text-gray-600">Discovering and loading question files...</p>
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
                  questions={questions}
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
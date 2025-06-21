import React, { useState } from 'react';
import { Question, QuestionSet, StudyProgress, SpacedRepetitionSettings, UploadedFile } from './types/Question';
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
  const [uploadedFiles, setUploadedFiles] = useLocalStorage<UploadedFile[]>('studyquest-uploaded-files', []);
  const [spacedRepetitionSettings, setSpacedRepetitionSettings] = useLocalStorage<SpacedRepetitionSettings>(
    'studyquest-spaced-settings', 
    defaultSpacedRepetitionSettings
  );
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<Question[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResultsType | null>(null);

  const handleUpload = (questionSets: QuestionSet[], filenames: string[]) => {
    // Process all question sets
    const allNewQuestions: Question[] = [];
    const newUploadedFiles: UploadedFile[] = [];
    
    questionSets.forEach((questionSet, index) => {
      const filename = filenames[index];
      const newQuestions = questionSet.questions.map(q => ({
        ...q,
        id: q.id || `${Date.now()}-${Math.random()}`,
        sourceFile: filename
      }));
      
      allNewQuestions.push(...newQuestions);
      
      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${index}`,
        filename,
        uploadDate: new Date(),
        questionCount: newQuestions.length,
        subjects: [...new Set(newQuestions.map(q => q.subject))],
        questionIds: newQuestions.map(q => q.id)
      };
      
      newUploadedFiles.push(uploadedFile);
    });
    
    setQuestions(prev => [...prev, ...allNewQuestions]);
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    
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

  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = uploadedFiles.find(f => f.id === fileId);
    if (!fileToDelete) return;

    // Remove questions from this file
    setQuestions(prev => prev.filter(q => !fileToDelete.questionIds.includes(q.id)));
    
    // Remove progress for questions from this file
    setProgress(prev => prev.filter(p => !fileToDelete.questionIds.includes(p.questionId)));
    
    // Remove the file record
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleReuploadFile = (fileId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const questionSet: QuestionSet = JSON.parse(content);
        
        if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
          alert(`Invalid question set format in file: ${file.name}`);
          return;
        }

        const fileToReplace = uploadedFiles.find(f => f.id === fileId);
        if (!fileToReplace) return;

        // Remove old questions and progress
        setQuestions(prev => prev.filter(q => !fileToReplace.questionIds.includes(q.id)));
        setProgress(prev => prev.filter(p => !fileToReplace.questionIds.includes(p.questionId)));

        // Add new questions
        const newQuestions = questionSet.questions.map(q => ({
          ...q,
          id: q.id || `${Date.now()}-${Math.random()}`,
          sourceFile: file.name
        }));

        setQuestions(prev => [...prev, ...newQuestions]);

        // Update file record
        const updatedFile: UploadedFile = {
          ...fileToReplace,
          filename: file.name,
          uploadDate: new Date(),
          questionCount: newQuestions.length,
          subjects: [...new Set(newQuestions.map(q => q.subject))],
          questionIds: newQuestions.map(q => q.id)
        };

        setUploadedFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f));

        // Initialize progress for new questions
        const newProgress = newQuestions.map(q => ({
          questionId: q.id,
          correctCount: 0,
          incorrectCount: 0,
          lastAnswered: new Date(),
          nextReview: new Date(),
          easeFactor: 2.5
        }));

        setProgress(prev => [...prev, ...newProgress]);

        alert(`Successfully re-uploaded "${file.name}" with ${newQuestions.length} questions!`);
      } catch (error) {
        alert(`Error re-uploading file "${file.name}": ${error instanceof Error ? error.message : 'Please check the file format.'}`);
      }
    };
    reader.readAsText(file);
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
    setUploadedFiles([]);
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
                  uploadedFiles={uploadedFiles}
                  onStartQuiz={handleStartQuiz}
                  onStartReview={handleStartReview}
                  onClearData={handleClearData}
                  onUpdateSpacedRepetitionSettings={setSpacedRepetitionSettings}
                  onDeleteFile={handleDeleteFile}
                  onReuploadFile={handleReuploadFile}
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
import React from 'react';
import { QuizResults as QuizResultsType } from './QuizMode';
import { Trophy, Clock, Target, BarChart3, Home, RotateCcw } from 'lucide-react';

interface QuizResultsProps {
  results: QuizResultsType;
  onHome: () => void;
  onRetake: () => void;
}

export function QuizResults({ results, onHome, onRetake }: QuizResultsProps) {
  const accuracy = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const averageTime = Math.round(results.timeSpent / results.totalQuestions / 1000);
  
  const getGrade = (accuracy: number) => {
    if (accuracy >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (accuracy >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (accuracy >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (accuracy >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const gradeInfo = getGrade(accuracy);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 ${gradeInfo.bg} rounded-full mb-4`}>
          <Trophy className={`h-10 w-10 ${gradeInfo.color}`} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
        <p className="text-gray-600">Here's how you performed</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 ${gradeInfo.bg} rounded-full mb-3`}>
            <span className={`text-xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
          <p className="text-sm text-gray-600">Accuracy</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-blue-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{results.correctAnswers}</p>
          <p className="text-sm text-gray-600">Correct Answers</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-purple-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{results.totalQuestions}</p>
          <p className="text-sm text-gray-600">Total Questions</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="bg-orange-100 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{averageTime}s</p>
          <p className="text-sm text-gray-600">Avg. Time</p>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
        <div className="space-y-3">
          {results.questionResults.map((result, index) => (
            <div
              key={result.questionId}
              className={`p-3 rounded-lg border ${
                result.isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Question {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {Math.round(result.timeSpent / 1000)}s
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onHome}
          className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </button>
        <button
          onClick={onRetake}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
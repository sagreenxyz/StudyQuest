import React, { useState } from 'react';
import { Question, StudyProgress, SpacedRepetitionSettings } from '../types/Question';
import { BarChart3, Clock, Target, TrendingUp, BookOpen, Zap, Trash2, AlertTriangle, Tag, ChevronDown, ChevronUp, Brain, Info, Calendar, RotateCcw, Settings, Sliders } from 'lucide-react';
import { QuizConfiguration } from './QuizConfiguration';
import { SpacedRepetitionConfig } from './SpacedRepetitionConfig';
import { SpacedRepetitionSettingsComponent } from './SpacedRepetitionSettings';
import { getQuestionsForReview, isQuestionMastered } from '../utils/spacedRepetition';

interface DashboardProps {
  questions: Question[];
  progress: StudyProgress[];
  spacedRepetitionSettings: SpacedRepetitionSettings;
  onStartQuiz: (questions: Question[]) => void;
  onStartReview: () => void;
  onClearData: () => void;
  onUpdateSpacedRepetitionSettings: (settings: SpacedRepetitionSettings) => void;
}

export function Dashboard({ 
  questions, 
  progress, 
  spacedRepetitionSettings,
  onStartQuiz, 
  onStartReview, 
  onClearData,
  onUpdateSpacedRepetitionSettings
}: DashboardProps) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showSpacedRepetitionInfo, setShowSpacedRepetitionInfo] = useState(false);
  const [showQuizConfig, setShowQuizConfig] = useState(false);
  const [showSpacedConfig, setShowSpacedConfig] = useState(false);
  const [showSpacedSettings, setShowSpacedSettings] = useState(false);
  const [quizConfigType, setQuizConfigType] = useState<'practice' | 'subject'>('practice');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const totalQuestions = questions.length;
  const studiedQuestions = progress.length;
  const masteredQuestions = progress.filter(p => isQuestionMastered(p, spacedRepetitionSettings)).length;
  const reviewDue = getQuestionsForReview(progress).length;

  const subjects = [...new Set(questions.map(q => q.subject))];
  const subjectStats = subjects.map(subject => {
    const subjectQuestions = questions.filter(q => q.subject === subject);
    const subjectProgress = progress.filter(p => 
      subjectQuestions.some(q => q.id === p.questionId)
    );
    const mastered = subjectProgress.filter(p => isQuestionMastered(p, spacedRepetitionSettings)).length;
    
    return {
      subject,
      total: subjectQuestions.length,
      studied: subjectProgress.length,
      mastered,
      progress: subjectQuestions.length > 0 ? (mastered / subjectQuestions.length) * 100 : 0
    };
  });

  // Get topic statistics with proper progress calculation
  const topics = [...new Set(questions.map(q => q.topic))];
  const topicStats = topics.map(topic => {
    const topicQuestions = questions.filter(q => q.topic === topic);
    const topicProgress = progress.filter(p => 
      topicQuestions.some(q => q.id === p.questionId)
    );
    const mastered = topicProgress.filter(p => isQuestionMastered(p, spacedRepetitionSettings)).length;
    const studied = topicProgress.length;
    
    return {
      topic,
      subject: topicQuestions[0]?.subject || 'Unknown',
      total: topicQuestions.length,
      studied,
      mastered,
      progress: topicQuestions.length > 0 ? (mastered / topicQuestions.length) * 100 : 0,
      studiedProgress: topicQuestions.length > 0 ? (studied / topicQuestions.length) * 100 : 0
    };
  }).sort((a, b) => b.progress - a.progress);

  const recentActivity = progress
    .sort((a, b) => b.lastAnswered.getTime() - a.lastAnswered.getTime())
    .slice(0, 5);

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all questions and progress? This action cannot be undone.')) {
      onClearData();
    }
  };

  const handlePracticeAllClick = () => {
    setQuizConfigType('practice');
    setShowQuizConfig(true);
  };

  const handleSubjectPracticeClick = (subject: string) => {
    setSelectedSubject(subject);
    setQuizConfigType('subject');
    setShowQuizConfig(true);
  };

  const handleTopicPracticeClick = (topic: string) => {
    const topicQuestions = questions.filter(q => q.topic === topic);
    onStartQuiz(topicQuestions);
  };

  const handleSpacedReviewClick = () => {
    setShowSpacedConfig(true);
  };

  const handleSpacedReviewStart = (filteredQuestions: Question[]) => {
    setShowSpacedConfig(false);
    onStartQuiz(filteredQuestions);
  };

  const getQuizConfigTitle = () => {
    if (quizConfigType === 'practice') {
      return 'Configure Practice Quiz';
    } else {
      return `Configure ${selectedSubject} Quiz`;
    }
  };

  const getQuizConfigDescription = () => {
    if (quizConfigType === 'practice') {
      return 'Customize your practice session with all available questions';
    } else {
      return `Practice questions from ${selectedSubject} subject`;
    }
  };

  const getQuizConfigQuestions = () => {
    if (quizConfigType === 'practice') {
      return questions;
    } else {
      return questions.filter(q => q.subject === selectedSubject);
    }
  };

  const displayedTopics = showAllTopics ? topicStats : topicStats.slice(0, 8);

  const formatHours = (hours: number): string => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Studied</p>
              <p className="text-2xl font-bold text-gray-900">{studiedQuestions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mastered</p>
              <p className="text-2xl font-bold text-gray-900">{masteredQuestions}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Due for Review</p>
              <p className="text-2xl font-bold text-gray-900">{reviewDue}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Explanation */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900">How Spaced Repetition Works</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSpacedSettings(true)}
              className="flex items-center px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
              title="Configure spaced repetition settings"
            >
              <Sliders className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button
              onClick={() => setShowSpacedRepetitionInfo(!showSpacedRepetitionInfo)}
              className="flex items-center px-3 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
            >
              <Info className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {showSpacedRepetitionInfo ? 'Hide Details' : 'Learn More'}
              </span>
              {showSpacedRepetitionInfo ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>

        <p className="text-indigo-800 mb-4">
          StudyQuest uses an intelligent spaced repetition algorithm based on the proven SM-2 method to optimize your learning retention and minimize study time.
        </p>

        {/* Current Settings Summary */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-indigo-200 mb-4">
          <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Current Review Schedule
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-1">
                1st Correct
              </div>
              <p className="font-medium text-gray-900">{formatHours(spacedRepetitionSettings.firstReviewHours)}</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium mb-1">
                2nd Correct
              </div>
              <p className="font-medium text-gray-900">{formatHours(spacedRepetitionSettings.secondReviewHours)}</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium mb-1">
                Incorrect
              </div>
              <p className="font-medium text-gray-900">{formatHours(spacedRepetitionSettings.incorrectReviewHours)}</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium mb-1">
                Mastery
              </div>
              <p className="font-medium text-gray-900">{spacedRepetitionSettings.masteryThreshold} correct</p>
            </div>
          </div>
        </div>

        {showSpacedRepetitionInfo && (
          <div className="space-y-4 border-t border-indigo-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-indigo-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Review Schedule
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">1st Correct</div>
                    <div>
                      <p className="font-medium text-gray-900">Review in {formatHours(spacedRepetitionSettings.firstReviewHours)}</p>
                      <p className="text-gray-600">First successful recall</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">2nd Correct</div>
                    <div>
                      <p className="font-medium text-gray-900">Review in {formatHours(spacedRepetitionSettings.secondReviewHours)}</p>
                      <p className="text-gray-600">Strengthening memory</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">3+ Correct</div>
                    <div>
                      <p className="font-medium text-gray-900">Increasing intervals</p>
                      <p className="text-gray-600">Based on your performance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Incorrect</div>
                    <div>
                      <p className="font-medium text-gray-900">Review in {formatHours(spacedRepetitionSettings.incorrectReviewHours)}</p>
                      <p className="text-gray-600">Reset and reinforce</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-indigo-900 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Adaptive Learning
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Ease Factor:</strong> Questions you find easy appear less frequently over time</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Difficulty Adjustment:</strong> Challenging questions appear more often until mastered</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Mastery Tracking:</strong> Questions with {spacedRepetitionSettings.masteryThreshold}+ correct answers are considered mastered</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p><strong>Optimal Timing:</strong> Reviews appear just before you're likely to forget</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                <RotateCcw className="h-4 w-4 mr-2" />
                Two Study Modes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Practice All Questions</span>
                  </div>
                  <p className="text-gray-600 ml-6">
                    Study all questions in random order, regardless of spaced repetition schedule. Perfect for comprehensive review or exam preparation.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900">Spaced Review</span>
                  </div>
                  <p className="text-gray-600 ml-6">
                    Study questions that are due for review based on the spaced repetition algorithm. Filter by subject and topic for focused sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>💡 Pro Tip:</strong> For best results, use "Spaced Review" daily to maintain your knowledge, and "Practice All Questions" when preparing for exams or when you want comprehensive coverage. Customize the review timing and mastery threshold in Settings to match your learning schedule.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
          <div className="space-y-3">
            <button
              onClick={handlePracticeAllClick}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <span className="font-medium text-blue-900 block">Configure Practice Quiz</span>
                  <span className="text-xs text-blue-600">Filter by subjects, topics, and question count</span>
                </div>
              </div>
              <span className="text-sm text-blue-600">{totalQuestions} available</span>
            </button>

            {reviewDue > 0 ? (
              <button
                onClick={handleSpacedReviewClick}
                className="w-full flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-orange-600 mr-3" />
                  <div className="text-left">
                    <span className="font-medium text-orange-900 block">Configure Spaced Review</span>
                    <span className="text-xs text-orange-600">Filter by subjects and topics</span>
                  </div>
                </div>
                <span className="text-sm text-orange-600">{reviewDue} due</span>
              </button>
            ) : (
              <button
                onClick={onStartReview}
                className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed opacity-60"
                disabled
              >
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="text-left">
                    <span className="font-medium text-gray-600 block">No Reviews Due</span>
                    <span className="text-xs text-gray-500">All caught up!</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">0 questions</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const question = questions.find(q => q.id === activity.questionId);
                return (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {question?.topic || 'Unknown Topic'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {question?.subject} • {activity.lastAnswered.toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isQuestionMastered(activity, spacedRepetitionSettings)
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isQuestionMastered(activity, spacedRepetitionSettings) ? 'Mastered' : 'Learning'}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Progress by Subject
          </h3>
          {totalQuestions > 0 && (
            <button
              onClick={handleClearData}
              className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Clear all data"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Clear Data</span>
            </button>
          )}
        </div>
        <div className="space-y-4">
          {subjectStats.map(stat => (
            <div key={stat.subject} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{stat.subject}</span>
                <span className="text-sm text-gray-600">
                  {stat.mastered}/{stat.total} mastered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{Math.round(stat.progress)}% mastered</span>
                <button
                  onClick={() => handleSubjectPracticeClick(stat.subject)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Configure Quiz →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Progress */}
      {topics.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Progress by Topic
            </h3>
            {topics.length > 8 && (
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <span className="text-sm font-medium mr-2">
                  {showAllTopics ? 'Show Less' : `Show All ${topics.length} Topics`}
                </span>
                {showAllTopics ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedTopics.map(stat => (
              <div key={stat.topic} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium text-gray-900 text-sm">{stat.topic}</span>
                    <p className="text-xs text-gray-500">{stat.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600 block">
                      {stat.mastered}/{stat.total} mastered
                    </span>
                    <span className="text-xs text-gray-500">
                      {stat.studied}/{stat.total} studied
                    </span>
                  </div>
                </div>
                
                {/* Mastery Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                
                {/* Study Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
                  <div
                    className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${stat.studiedProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <span className="block">{Math.round(stat.progress)}% mastered</span>
                    <span className="text-blue-600">{Math.round(stat.studiedProgress)}% studied</span>
                  </div>
                  <button
                    onClick={() => handleTopicPracticeClick(stat.topic)}
                    className="text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1 hover:bg-purple-50 rounded transition-colors duration-200"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!showAllTopics && topics.length > 8 && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Showing top 8 topics by mastery progress. Click "Show All Topics" to see all {topics.length} topics.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Data Management Warning */}
      {totalQuestions > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-amber-800 font-medium mb-1">Data Management</p>
              <p className="text-amber-700">
                Your questions and progress are stored locally in your browser. Use "Clear Data" to remove all 
                questions and progress when you want to start fresh with new study materials.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Configuration Modal */}
      {showQuizConfig && (
        <QuizConfiguration
          questions={getQuizConfigQuestions()}
          onStartQuiz={onStartQuiz}
          onClose={() => setShowQuizConfig(false)}
          title={getQuizConfigTitle()}
          description={getQuizConfigDescription()}
        />
      )}

      {/* Spaced Repetition Configuration Modal */}
      {showSpacedConfig && (
        <SpacedRepetitionConfig
          questions={questions}
          progress={progress}
          onStartReview={handleSpacedReviewStart}
          onClose={() => setShowSpacedConfig(false)}
        />
      )}

      {/* Spaced Repetition Settings Modal */}
      {showSpacedSettings && (
        <SpacedRepetitionSettingsComponent
          settings={spacedRepetitionSettings}
          onSave={onUpdateSpacedRepetitionSettings}
          onClose={() => setShowSpacedSettings(false)}
        />
      )}
    </div>
  );
}
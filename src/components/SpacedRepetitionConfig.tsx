import React, { useState, useEffect } from 'react';
import { Question, StudyProgress } from '../types/Question';
import { Clock, Filter, BookOpen, Tag, Play, X, Brain } from 'lucide-react';
import { getQuestionsForReview } from '../utils/spacedRepetition';

interface SpacedRepetitionConfigProps {
  questions: Question[];
  progress: StudyProgress[];
  onStartReview: (questions: Question[]) => void;
  onClose: () => void;
}

export function SpacedRepetitionConfig({ questions, progress, onStartReview, onClose }: SpacedRepetitionConfigProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  // Get all questions that are due for review
  const dueQuestionIds = getQuestionsForReview(progress);
  const allDueQuestions = questions.filter(q => dueQuestionIds.includes(q.id));

  // Get unique subjects and topics from due questions
  const subjects = [...new Set(allDueQuestions.map(q => q.subject))].sort();
  const allTopics = [...new Set(allDueQuestions.map(q => q.topic))].sort();
  
  // Get topics for selected subjects
  const availableTopics = selectedSubjects.length > 0 
    ? allTopics.filter(topic => 
        allDueQuestions.some(q => q.topic === topic && selectedSubjects.includes(q.subject))
      )
    : allTopics;

  // Update filtered questions when selections change
  useEffect(() => {
    let filtered = allDueQuestions;

    // Filter by subjects
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(q => selectedSubjects.includes(q.subject));
    }

    // Filter by topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(q => selectedTopics.includes(q.topic));
    }

    setFilteredQuestions(filtered);
  }, [selectedSubjects, selectedTopics, allDueQuestions]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject];
      
      // Clear topic selections if no subjects are selected
      if (newSelection.length === 0) {
        setSelectedTopics([]);
      } else {
        // Remove topics that don't belong to selected subjects
        setSelectedTopics(prevTopics => 
          prevTopics.filter(topic =>
            allDueQuestions.some(q => q.topic === topic && newSelection.includes(q.subject))
          )
        );
      }
      
      return newSelection;
    });
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleSelectAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
      setSelectedTopics([]);
    } else {
      setSelectedSubjects(subjects);
    }
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(availableTopics);
    }
  };

  const handleStartReview = () => {
    if (filteredQuestions.length === 0) return;
    onStartReview(filteredQuestions);
  };

  const getSubjectQuestionCount = (subject: string) => {
    return allDueQuestions.filter(q => q.subject === subject).length;
  };

  const getTopicQuestionCount = (topic: string) => {
    return allDueQuestions.filter(q => q.topic === topic).length;
  };

  // If no questions are due for review
  if (allDueQuestions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-6 w-6 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">No Reviews Due</h2>
                  <p className="text-orange-100 text-sm">All caught up!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6 text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Great job!</h3>
            <p className="text-gray-600 mb-4">
              You don't have any questions due for spaced repetition review right now. 
              Check back later or use "Practice All Questions" to continue studying.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Configure Spaced Review</h2>
                <p className="text-orange-100 text-sm">Filter questions due for review by subject and topic</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subject Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-orange-600" />
                  Subjects
                </h3>
                <button
                  onClick={handleSelectAllSubjects}
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  {selectedSubjects.length === subjects.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {subjects.map(subject => {
                  const questionCount = getSubjectQuestionCount(subject);
                  const isSelected = selectedSubjects.includes(subject);
                  
                  return (
                    <label
                      key={subject}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 text-orange-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubjectToggle(subject)}
                          className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                        />
                        <span className="ml-3 font-medium">{subject}</span>
                      </div>
                      <span className="text-sm text-gray-500">{questionCount}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Topic Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-red-600" />
                  Topics
                </h3>
                {availableTopics.length > 0 && (
                  <button
                    onClick={handleSelectAllTopics}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    {selectedTopics.length === availableTopics.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              
              {availableTopics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select subjects to see available topics</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableTopics.map(topic => {
                    const questionCount = getTopicQuestionCount(topic);
                    const isSelected = selectedTopics.includes(topic);
                    const topicSubject = allDueQuestions.find(q => q.topic === topic)?.subject;
                    
                    return (
                      <label
                        key={topic}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-red-50 border-red-300 text-red-900'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTopicToggle(topic)}
                            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                          />
                          <div className="ml-3">
                            <span className="font-medium block">{topic}</span>
                            <span className="text-xs text-gray-500">{topicSubject}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{questionCount}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Review Summary
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Due for Review:</span>
                    <span className="font-medium text-gray-900">{allDueQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filtered Questions:</span>
                    <span className="font-medium text-gray-900">{filteredQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Subjects:</span>
                    <span className="font-medium text-gray-900">
                      {selectedSubjects.length > 0 ? selectedSubjects.length : 'All'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Topics:</span>
                    <span className="font-medium text-gray-900">
                      {selectedTopics.length > 0 ? selectedTopics.length : 'All'}
                    </span>
                  </div>
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Selected Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSubjects.map(subject => (
                        <span key={subject} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTopics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Selected Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTopics.slice(0, 3).map(topic => (
                        <span key={topic} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                      {selectedTopics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{selectedTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Spaced Repetition Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  About Spaced Review
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>These questions are due for review based on:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Your previous performance on each question</li>
                    <li>The spaced repetition algorithm (SM-2)</li>
                    <li>Time since last review</li>
                    <li>Individual question difficulty factors</li>
                  </ul>
                  <p className="text-xs italic mt-2">
                    Regular spaced review sessions help move knowledge from short-term to long-term memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredQuestions.length === 0 ? (
                <span className="text-red-600 font-medium">No questions match your selection</span>
              ) : (
                <span>
                  Ready to review <strong>{filteredQuestions.length}</strong> question{filteredQuestions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleStartReview}
                disabled={filteredQuestions.length === 0}
                className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
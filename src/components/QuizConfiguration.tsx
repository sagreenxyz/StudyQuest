import React, { useState, useEffect } from 'react';
import { Question } from '../types/Question';
import { Settings, Filter, Hash, BookOpen, Tag, Play, X } from 'lucide-react';

interface QuizConfigurationProps {
  questions: Question[];
  onStartQuiz: (questions: Question[]) => void;
  onClose: () => void;
  title: string;
  description: string;
}

export function QuizConfiguration({ questions, onStartQuiz, onClose, title, description }: QuizConfigurationProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>(questions);

  // Get unique subjects and topics
  const subjects = [...new Set(questions.map(q => q.subject))].sort();
  const allTopics = [...new Set(questions.map(q => q.topic))].sort();
  
  // Get topics for selected subjects
  const availableTopics = selectedSubjects.length > 0 
    ? allTopics.filter(topic => 
        questions.some(q => q.topic === topic && selectedSubjects.includes(q.subject))
      )
    : allTopics;

  // Update filtered questions when selections change
  useEffect(() => {
    let filtered = questions;

    // Filter by subjects
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(q => selectedSubjects.includes(q.subject));
    }

    // Filter by topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(q => selectedTopics.includes(q.topic));
    }

    setFilteredQuestions(filtered);
    
    // Adjust question count if it exceeds available questions
    if (questionCount > filtered.length) {
      setQuestionCount(filtered.length);
    }
  }, [selectedSubjects, selectedTopics, questions, questionCount]);

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
            questions.some(q => q.topic === topic && newSelection.includes(q.subject))
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

  const handleStartQuiz = () => {
    if (filteredQuestions.length === 0) return;
    
    // Shuffle and limit questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, questionCount);
    
    onStartQuiz(selectedQuestions);
  };

  const getSubjectQuestionCount = (subject: string) => {
    return questions.filter(q => q.subject === subject).length;
  };

  const getTopicQuestionCount = (topic: string) => {
    return questions.filter(q => q.topic === topic).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-blue-100 text-sm">{description}</p>
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
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Subjects
                </h3>
                <button
                  onClick={handleSelectAllSubjects}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubjectToggle(subject)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                  <Tag className="h-5 w-5 mr-2 text-purple-600" />
                  Topics
                </h3>
                {availableTopics.length > 0 && (
                  <button
                    onClick={handleSelectAllTopics}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
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
                    const topicSubject = questions.find(q => q.topic === topic)?.subject;
                    
                    return (
                      <label
                        key={topic}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 text-purple-900'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTopicToggle(topic)}
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
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

            {/* Configuration & Summary */}
            <div className="space-y-6">
              {/* Question Count */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-green-600" />
                  Question Count
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="questionCount" className="text-sm font-medium text-gray-700">
                      Number of questions:
                    </label>
                    <span className="text-sm text-gray-500">
                      Max: {filteredQuestions.length}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    id="questionCount"
                    min="1"
                    max={Math.max(1, filteredQuestions.length)}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, filteredQuestions.length)}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Math.min(parseInt(e.target.value) || 1, filteredQuestions.length))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-lg font-bold text-gray-900">{questionCount}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Quiz Summary
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Questions:</span>
                    <span className="font-medium text-gray-900">{filteredQuestions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected Questions:</span>
                    <span className="font-medium text-gray-900">{questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-medium text-gray-900">
                      {selectedSubjects.length > 0 ? selectedSubjects.length : 'All'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topics:</span>
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
                        <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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
                        <span key={topic} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
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
                  Ready to start quiz with <strong>{questionCount}</strong> question{questionCount !== 1 ? 's' : ''}
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
                onClick={handleStartQuiz}
                disabled={filteredQuestions.length === 0}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { StudyProgress } from '../types/Question';
import { Clock, Filter, BookOpen, Tag, Play, X, Brain } from 'lucide-react';
import { getQuestionsForReview } from '../utils/spacedRepetition';
import { QuestionIndex, QuestionMetadata } from '../services/QuestionService';

interface SpacedRepetitionConfigProps {
  questionIndex: QuestionIndex;
  progress: StudyProgress[];
  onStartReview: (questionIds: string[]) => void;
  onClose: () => void;
}

export function SpacedRepetitionConfig({ questionIndex, progress, onStartReview, onClose }: SpacedRepetitionConfigProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [filteredMetadata, setFilteredMetadata] = useState<QuestionMetadata[]>([]);

  // Get all questions that are due for review
  const dueQuestionIds = getQuestionsForReview(progress);
  const allDueMetadata = questionIndex.questions.filter(q => dueQuestionIds.includes(q.id));

  // Get unique subjects and topics from due questions
  const subjects = [...new Set(allDueMetadata.map(q => q.subject))].sort();
  const allTopics = [...new Set(allDueMetadata.map(q => q.topic))].sort();

  // Get topics for selected subjects
  const availableTopics = selectedSubjects.length > 0
    ? allTopics.filter(topic =>
        allDueMetadata.some(q => q.topic === topic && selectedSubjects.includes(q.subject))
      )
    : allTopics;

  // Update filtered questions when selections change
  useEffect(() => {
    let filtered = allDueMetadata;

    // Filter by subjects
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(q => selectedSubjects.includes(q.subject));
    }

    // Filter by topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(q => selectedTopics.includes(q.topic));
    }

    setFilteredMetadata(filtered);
  }, [selectedSubjects, selectedTopics, allDueMetadata]);

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
            allDueMetadata.some(q => q.topic === topic && newSelection.includes(q.subject))
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
    if (filteredMetadata.length === 0) return;

    // Get question IDs from filtered metadata
    const questionIds = filteredMetadata.map(q => q.id);
    onStartReview(questionIds);
  };

  const getSubjectQuestionCount = (subject: string) => {
    return allDueMetadata.filter(q => q.subject === subject).length;
  };

  const getTopicQuestionCount = (topic: string) => {
    return allDueMetadata.filter(q => q.topic === topic).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Configure Spaced Review</h2>
                <p className="text-orange-100 text-sm">Customize your review session with questions due for review</p>
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
          {allDueMetadata.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Due for Review</h3>
              <p className="text-gray-600">
                All caught up! Check back later when more questions are due for review.
              </p>
            </div>
          ) : (
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
                    className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                  >
                    {selectedSubjects.length === subjects.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="space-y-2">
                  {subjects.map(subject => (
                    <label
                      key={subject}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedSubjects.includes(subject)
                          ? 'bg-orange-50 border-orange-300 text-orange-900'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 mr-3"
                        />
                        <span className="font-medium">{subject}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {getSubjectQuestionCount(subject)}
                      </span>
                    </label>
                  ))}
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
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      {selectedTopics.length === availableTopics.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableTopics.length > 0 ? (
                    availableTopics.map(topic => (
                      <label
                        key={topic}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedTopics.includes(topic)
                            ? 'bg-red-50 border-red-300 text-red-900'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic)}
                            onChange={() => handleTopicToggle(topic)}
                            className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500 mr-3 flex-shrink-0"
                          />
                          <span className="font-medium truncate">{topic}</span>
                        </div>
                        <span className="text-sm text-gray-600 ml-2 flex-shrink-0">
                          {getTopicQuestionCount(topic)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {selectedSubjects.length > 0
                          ? 'No topics available for selected subjects'
                          : 'Select subjects to see available topics'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Review Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Due:</span>
                    <span className="font-semibold text-gray-900">{allDueMetadata.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Selected:</span>
                    <span className="font-semibold text-orange-600">{filteredMetadata.length}</span>
                  </div>

                  {selectedSubjects.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600 block mb-1">Selected Subjects:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSubjects.map(subject => (
                          <span
                            key={subject}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTopics.length > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600 block mb-1">Selected Topics:</span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {selectedTopics.map(topic => (
                          <span
                            key={topic}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {filteredMetadata.length === 0 && (selectedSubjects.length > 0 || selectedTopics.length > 0) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      No questions match your current filters. Try adjusting your selections.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Leave all filters unselected to review all due questions, or select specific subjects and topics for focused review sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Filter className="h-4 w-4 inline mr-2" />
              {filteredMetadata.length > 0
                ? `Ready to review ${filteredMetadata.length} question${filteredMetadata.length !== 1 ? 's' : ''}`
                : 'No questions selected'}
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
                disabled={filteredMetadata.length === 0}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

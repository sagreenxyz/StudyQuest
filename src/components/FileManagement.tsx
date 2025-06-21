import React, { useState } from 'react';
import { UploadedFile, Question, StudyProgress } from '../types/Question';
import { FileText, Calendar, Hash, BookOpen, Trash2, Upload, AlertTriangle, X, Download, Eye, EyeOff } from 'lucide-react';

interface FileManagementProps {
  uploadedFiles: UploadedFile[];
  questions: Question[];
  progress: StudyProgress[];
  onDeleteFile: (fileId: string) => void;
  onReuploadFile: (fileId: string, file: File) => void;
  onClose: () => void;
}

export function FileManagement({ 
  uploadedFiles, 
  questions, 
  progress, 
  onDeleteFile, 
  onReuploadFile, 
  onClose 
}: FileManagementProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [fileToReupload, setFileToReupload] = useState<string | null>(null);

  const toggleFileExpansion = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const handleDeleteConfirm = (fileId: string) => {
    onDeleteFile(fileId);
    setFileToDelete(null);
  };

  const handleReuploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && fileToReupload) {
      onReuploadFile(fileToReupload, file);
      setFileToReupload(null);
    }
    // Reset the input
    event.target.value = '';
  };

  const getFileQuestions = (file: UploadedFile) => {
    return questions.filter(q => file.questionIds.includes(q.id));
  };

  const getFileProgress = (file: UploadedFile) => {
    return progress.filter(p => file.questionIds.includes(p.questionId));
  };

  const getFileStats = (file: UploadedFile) => {
    const fileQuestions = getFileQuestions(file);
    const fileProgress = getFileProgress(file);
    const studied = fileProgress.length;
    const mastered = fileProgress.filter(p => p.correctCount >= 3).length;
    
    return {
      total: fileQuestions.length,
      studied,
      mastered,
      studiedPercentage: fileQuestions.length > 0 ? Math.round((studied / fileQuestions.length) * 100) : 0,
      masteredPercentage: fileQuestions.length > 0 ? Math.round((mastered / fileQuestions.length) * 100) : 0
    };
  };

  const sortedFiles = [...uploadedFiles].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">File Management</h2>
                <p className="text-blue-100 text-sm">Manage your uploaded question files</p>
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
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files Uploaded</h3>
              <p className="text-gray-600">Upload some question files to see them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFiles.map(file => {
                const stats = getFileStats(file);
                const isExpanded = expandedFiles.has(file.id);
                const fileQuestions = getFileQuestions(file);
                
                return (
                  <div key={file.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    {/* File Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{file.filename}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {file.uploadDate.toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {file.questionCount} questions
                              </span>
                              <span className="flex items-center">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {file.subjects.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFileExpansion(file.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title={isExpanded ? 'Hide details' : 'Show details'}
                          >
                            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          
                          <label className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer" title="Re-upload file">
                            <Upload className="h-4 w-4" />
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleReuploadFile}
                              onClick={() => setFileToReupload(file.id)}
                              className="hidden"
                            />
                          </label>
                          
                          <button
                            onClick={() => setFileToDelete(file.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Study Progress</span>
                          <span className="text-gray-900 font-medium">{stats.studied}/{stats.total} studied ({stats.studiedPercentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.studiedPercentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Mastery Progress</span>
                          <span className="text-gray-900 font-medium">{stats.mastered}/{stats.total} mastered ({stats.masteredPercentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.masteredPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">Question Breakdown</h4>
                        
                        {/* Question Types */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                          {['multiple-choice', 'select-all', 'true-false', 'flashcard', 'fact-card', 'matching'].map(type => {
                            const count = fileQuestions.filter(q => q.type === type).length;
                            if (count === 0) return null;
                            
                            return (
                              <div key={type} className="text-center">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="text-lg font-bold text-gray-900">{count}</p>
                                  <p className="text-xs text-gray-600 capitalize">{type.replace('-', ' ')}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Topics */}
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Topics</h5>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(fileQuestions.map(q => q.topic))].map(topic => (
                              <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {topic} ({fileQuestions.filter(q => q.topic === topic).length})
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Difficulty Distribution */}
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Difficulty Distribution</h5>
                          <div className="flex space-x-4">
                            {['easy', 'medium', 'hard'].map(difficulty => {
                              const count = fileQuestions.filter(q => q.difficulty === difficulty).length;
                              const percentage = fileQuestions.length > 0 ? Math.round((count / fileQuestions.length) * 100) : 0;
                              
                              return (
                                <div key={difficulty} className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    difficulty === 'easy' ? 'bg-green-500' :
                                    difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  <span className="text-sm text-gray-600 capitalize">
                                    {difficulty}: {count} ({percentage}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} • {questions.length} total questions
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete File</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{uploadedFiles.find(f => f.id === fileToDelete)?.filename}"? 
                This will remove all {uploadedFiles.find(f => f.id === fileToDelete)?.questionCount} questions 
                from this file and their associated progress data.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirm(fileToDelete)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
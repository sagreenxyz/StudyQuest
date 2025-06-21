import { useState, useEffect } from 'react';
import { QuestionSet } from '../types/Question';
import { FolderOpen, Download, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface ProjectFileLoaderProps {
  onLoad: (questionSets: QuestionSet[], filenames: string[]) => void;
  existingQuestionIds: string[];
}

interface ProjectFile {
  name: string;
  path: string;
  loaded: boolean;
  error?: string;
}

export function ProjectFileLoader({ onLoad, existingQuestionIds }: ProjectFileLoaderProps) {
  const [availableFiles, setAvailableFiles] = useState<ProjectFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Discover available JSON files in the public/questions directory
  useEffect(() => {
    const discoverFiles = async () => {
      setLoadingFiles(true);
      
      // Use Vite's import.meta.glob to find all .json files recursively
      const questionModules = import.meta.glob('/public/questions/**/*.json');
      
      const files: ProjectFile[] = Object.keys(questionModules).map(path => {
        const filename = path.replace('/public/questions/', '');
        // Note: vite.config.ts has base: '/StudyQuest/', so paths need to reflect that.
        const fetchPath = `/StudyQuest/questions/${filename}`;
        return {
          name: filename,
          path: fetchPath,
          loaded: false,
        };
      });

      setAvailableFiles(files);
      setLoadingFiles(false);
    };

    discoverFiles();
  }, []);

  const handleFileToggle = (filename: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === availableFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(availableFiles.map(f => f.name)));
    }
  };

  const handleLoadSelected = async () => {
    if (selectedFiles.size === 0) return;

    setLoading(true);
    const successfulQuestionSets: QuestionSet[] = [];
    const successfulFilenames: string[] = [];
    const errorMessages: string[] = [];
    const duplicateIds: string[] = [];
    const skippedQuestions: number[] = [];

    for (const filename of selectedFiles) {
      const file = availableFiles.find(f => f.name === filename);
      if (!file) continue;

      try {
        const response = await fetch(file.path);
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
        let skippedCount = 0;

        questionSet.questions.forEach((question, qIndex) => {
          if (!question.id || !question.type || !question.subject || !question.topic) {
            throw new Error(`Question ${qIndex + 1} in file "${filename}" is missing required fields (id, type, subject, topic)`);
          }

          // Check for duplicate IDs
          if (existingQuestionIds.includes(question.id)) {
            duplicateIds.push(question.id);
            skippedCount++;
            return; // Skip this question
          }

          // Check for duplicates within the current upload
          if (filteredQuestions.some(q => q.id === question.id)) {
            duplicateIds.push(question.id);
            skippedCount++;
            return; // Skip this question
          }

          // Validate question type specific fields (same validation as FileUpload)
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

        // Only add question set if it has questions after filtering
        if (filteredQuestions.length > 0) {
          // Add filename to question set name if not already present
          if (!questionSet.name || questionSet.name.trim() === '') {
            questionSet.name = filename.replace('.json', '');
          }

          // Update the question set with filtered questions
          const updatedQuestionSet = {
            ...questionSet,
            questions: filteredQuestions
          };

          successfulQuestionSets.push(updatedQuestionSet);
          successfulFilenames.push(filename);
        }

        // Track skipped questions for this file
        if (skippedCount > 0) {
          skippedQuestions.push(skippedCount);
        }

        // Mark file as loaded
        setAvailableFiles(prev => prev.map(f => 
          f.name === filename ? { ...f, loaded: true, error: undefined } : f
        ));

      } catch (error) {
        const errorMessage = `Error in file "${filename}": ${error instanceof Error ? error.message : 'Please check the file format.'}`;
        errorMessages.push(errorMessage);
        
        // Mark file as error
        setAvailableFiles(prev => prev.map(f => 
          f.name === filename ? { ...f, loaded: false, error: errorMessage } : f
        ));
      }
    }

    setLoading(false);

    // Process results
    if (successfulQuestionSets.length > 0) {
      onLoad(successfulQuestionSets, successfulFilenames);
    }

    // Show user feedback
    const totalNewQuestions = successfulQuestionSets.reduce((sum, qs) => sum + qs.questions.length, 0);
    const totalSkipped = skippedQuestions.reduce((sum, count) => sum + count, 0);

    let message = '';

    if (successfulQuestionSets.length > 0 && errorMessages.length === 0) {
      message = `Successfully loaded ${successfulQuestionSets.length} question set${successfulQuestionSets.length > 1 ? 's' : ''} with ${totalNewQuestions} total questions from project files!`;
      
      if (totalSkipped > 0) {
        message += `\n\n${totalSkipped} question${totalSkipped > 1 ? 's were' : ' was'} skipped due to duplicate IDs.`;
      }
    } else if (successfulQuestionSets.length > 0 && errorMessages.length > 0) {
      message = `Successfully loaded ${successfulQuestionSets.length} question set${successfulQuestionSets.length > 1 ? 's' : ''} with ${totalNewQuestions} total questions.`;
      
      if (totalSkipped > 0) {
        message += `\n\n${totalSkipped} question${totalSkipped > 1 ? 's were' : ' was'} skipped due to duplicate IDs.`;
      }
      
      message += `\n\nErrors in ${errorMessages.length} file${errorMessages.length > 1 ? 's' : ''}:\n${errorMessages.join('\n')}`;
    } else {
      if (totalSkipped > 0 && errorMessages.length === 0) {
        message = `No new questions were loaded. All ${totalSkipped} question${totalSkipped > 1 ? 's have' : ' has'} duplicate IDs and ${totalSkipped > 1 ? 'were' : 'was'} skipped.`;
      } else {
        message = `Failed to load any files:\n${errorMessages.join('\n')}`;
      }
    }

    alert(message);

    // Clear selection
    setSelectedFiles(new Set());
  };

  if (loadingFiles) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Loader className="h-5 w-5 text-blue-600 animate-spin mr-2" />
          <span className="text-blue-800">Discovering project files...</span>
        </div>
      </div>
    );
  }

  if (availableFiles.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <FolderOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No Project Files Found</h3>
          <p className="text-xs text-gray-600">
            Place JSON question files in the <code className="bg-gray-200 px-1 rounded">public/questions/</code> directory (and subdirectories) to load them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FolderOpen className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-sm font-semibold text-green-900">Load from Project Files</h3>
        </div>
        {availableFiles.length > 1 && (
          <button
            onClick={handleSelectAll}
            className="text-xs text-green-700 hover:text-green-900 font-medium"
          >
            {selectedFiles.size === availableFiles.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {availableFiles.map(file => (
          <label
            key={file.name}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              selectedFiles.has(file.name)
                ? 'bg-green-100 border-green-300 text-green-900'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFiles.has(file.name)}
                onChange={() => handleFileToggle(file.name)}
                className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500 mr-3"
              />
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {file.loaded && (
                <span title="Previously loaded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </span>
              )}
              {file.error && (
                <span title={file.error}>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </span>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-green-700">
          {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
        </p>
        
        <button
          onClick={handleLoadSelected}
          disabled={selectedFiles.size === 0 || loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Load Selected
            </>
          )}
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-green-200">
        <p className="text-xs text-green-700">
          <strong>Note:</strong> Project files are loaded from the <code className="bg-green-200 px-1 rounded">public/questions/</code> directory and its subdirectories. 
          Duplicate question IDs will be automatically skipped.
        </p>
      </div>
    </div>
  );
}
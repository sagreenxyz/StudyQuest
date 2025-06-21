import React, { useRef, useState } from 'react';
import { Upload, FileText, Image, FolderOpen } from 'lucide-react';
import { QuestionSet } from '../types/Question';
import { ProjectFileLoader } from './ProjectFileLoader';

interface FileUploadProps {
  onUpload: (questionSets: QuestionSet[], filenames: string[]) => void;
  existingQuestionIds?: string[];
  className?: string;
}

export function FileUpload({ onUpload, existingQuestionIds = [], className = '' }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'project'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let processedFiles = 0;
    const totalFiles = files.length;
    const successfulQuestionSets: QuestionSet[] = [];
    const successfulFilenames: string[] = [];
    const errorMessages: string[] = [];
    const duplicateIds: string[] = [];
    const skippedQuestions: number[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const questionSet: QuestionSet = JSON.parse(content);
          
          // Validate the structure
          if (!questionSet.questions || !Array.isArray(questionSet.questions)) {
            throw new Error(`Invalid question set format in file: ${file.name}`);
          }

          // Track duplicates and filter them out
          const filteredQuestions: typeof questionSet.questions = [];
          let skippedCount = 0;

          questionSet.questions.forEach((question, qIndex) => {
            if (!question.id || !question.type || !question.subject || !question.topic) {
              throw new Error(`Question ${qIndex + 1} in file "${file.name}" is missing required fields (id, type, subject, topic)`);
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
            
            // Validate question type specific fields
            if (question.type === 'multiple-choice') {
              const mcq = question as any;
              if (!mcq.question || !mcq.options || typeof mcq.correctAnswer !== 'number') {
                throw new Error(`Multiple choice question ${qIndex + 1} in file "${file.name}" is missing required fields`);
              }
            } else if (question.type === 'select-all') {
              const saq = question as any;
              if (!saq.question || !saq.options || !Array.isArray(saq.correctAnswers)) {
                throw new Error(`Select-all question ${qIndex + 1} in file "${file.name}" is missing required fields`);
              }
            } else if (question.type === 'true-false') {
              const tfq = question as any;
              if (!tfq.question || !tfq.options || typeof tfq.correctAnswer !== 'number') {
                throw new Error(`True-false question ${qIndex + 1} in file "${file.name}" is missing required fields`);
              }
              // Validate options are ["True", "False"]
              if (!Array.isArray(tfq.options) || tfq.options.length !== 2 || 
                  tfq.options[0] !== "True" || tfq.options[1] !== "False") {
                throw new Error(`True-false question ${qIndex + 1} in file "${file.name}" must have options ["True", "False"]`);
              }
              // Validate correctAnswer is 0 or 1
              if (tfq.correctAnswer !== 0 && tfq.correctAnswer !== 1) {
                throw new Error(`True-false question ${qIndex + 1} in file "${file.name}" must have correctAnswer 0 (True) or 1 (False)`);
              }
            } else if (question.type === 'flashcard') {
              const fcq = question as any;
              if (!fcq.front || !fcq.back) {
                throw new Error(`Flashcard ${qIndex + 1} in file "${file.name}" is missing required fields (front, back)`);
              }
            } else if (question.type === 'fact-card') {
              const factq = question as any;
              if (!factq.fact) {
                throw new Error(`Fact card ${qIndex + 1} in file "${file.name}" is missing required field (fact)`);
              }
            } else if (question.type === 'matching') {
              const matchq = question as any;
              if (!matchq.instruction || !matchq.pairs || !Array.isArray(matchq.pairs)) {
                throw new Error(`Matching question ${qIndex + 1} in file "${file.name}" is missing required fields (instruction, pairs)`);
              }
              // Validate each pair has term and definition
              matchq.pairs.forEach((pair: any, pairIndex: number) => {
                if (!pair.term || !pair.definition) {
                  throw new Error(`Matching question ${qIndex + 1}, pair ${pairIndex + 1} in file "${file.name}" is missing term or definition`);
                }
              });
            }

            // Add sourceFile to track which file this question came from
            question.sourceFile = file.name;

            // Add to filtered questions if it passes all validations
            filteredQuestions.push(question);
          });

          // Only add question set if it has questions after filtering
          if (filteredQuestions.length > 0) {
            // Add filename to question set name if not already present
            if (!questionSet.name || questionSet.name.trim() === '') {
              questionSet.name = file.name.replace('.json', '');
            }

            // Update the question set with filtered questions
            const updatedQuestionSet = {
              ...questionSet,
              questions: filteredQuestions
            };

            successfulQuestionSets.push(updatedQuestionSet);
            successfulFilenames.push(file.name);
          }

          // Track skipped questions for this file
          if (skippedCount > 0) {
            skippedQuestions.push(skippedCount);
          }

        } catch (error) {
          errorMessages.push(`Error in file "${file.name}": ${error instanceof Error ? error.message : 'Please check the file format.'}`);
          console.error(`File parsing error for ${file.name}:`, error);
        }
        
        processedFiles++;
        
        // Process results when all files are complete
        if (processedFiles === totalFiles) {
          if (successfulQuestionSets.length > 0) {
            onUpload(successfulQuestionSets, successfulFilenames);
          }
          
          // Show user feedback
          const totalNewQuestions = successfulQuestionSets.reduce((sum, qs) => sum + qs.questions.length, 0);
          const totalSkipped = skippedQuestions.reduce((sum, count) => sum + count, 0);
          
          let message = '';
          
          if (successfulQuestionSets.length > 0 && errorMessages.length === 0) {
            message = `Successfully uploaded ${successfulQuestionSets.length} question set${successfulQuestionSets.length > 1 ? 's' : ''} with ${totalNewQuestions} total questions!`;
            
            if (totalSkipped > 0) {
              message += `\n\n${totalSkipped} question${totalSkipped > 1 ? 's were' : ' was'} skipped due to duplicate IDs.`;
            }
          } else if (successfulQuestionSets.length > 0 && errorMessages.length > 0) {
            message = `Successfully uploaded ${successfulQuestionSets.length} question set${successfulQuestionSets.length > 1 ? 's' : ''} with ${totalNewQuestions} total questions.`;
            
            if (totalSkipped > 0) {
              message += `\n\n${totalSkipped} question${totalSkipped > 1 ? 's were' : ' was'} skipped due to duplicate IDs.`;
            }
            
            message += `\n\nErrors in ${errorMessages.length} file${errorMessages.length > 1 ? 's' : ''}:\n${errorMessages.join('\n')}`;
          } else {
            if (totalSkipped > 0 && errorMessages.length === 0) {
              message = `No new questions were uploaded. All ${totalSkipped} question${totalSkipped > 1 ? 's have' : ' has'} duplicate IDs and ${totalSkipped > 1 ? 'were' : 'was'} skipped.`;
            } else {
              message = `Failed to upload any files:\n${errorMessages.join('\n')}`;
            }
          }
          
          alert(message);
          
          // Reset the input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Tab Navigation */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'upload'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </button>
        <button
          onClick={() => setActiveTab('project')}
          className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            activeTab === 'project'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Project Files
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer group">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />
              <p className="mt-2 text-sm text-blue-600 group-hover:text-blue-700">
                Click to upload JSON question files
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Select multiple files to upload at once
              </p>
              <div className="flex items-center justify-center space-x-2 text-xs text-blue-500 mt-1">
                <FileText className="h-3 w-3" />
                <span>JSON files</span>
                <span>•</span>
                <Image className="h-3 w-3" />
                <span>Image support</span>
              </div>
              {existingQuestionIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Duplicate question IDs will be automatically skipped
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ProjectFileLoader 
          onLoad={onUpload} 
          existingQuestionIds={existingQuestionIds} 
        />
      )}
    </div>
  );
}
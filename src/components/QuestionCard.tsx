import React, { useState, useEffect } from 'react';
import { Question, MultipleChoiceQuestion, SelectAllQuestion, FlashcardQuestion, FactCardQuestion, MatchingQuestion, MatchingPair, TrueFalseQuestion } from '../types/Question';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: any) => void;
  showResult?: boolean;
  userAnswer?: any;
  isCorrect?: boolean;
}

export function QuestionCard({ question, onAnswer, showResult, userAnswer, isCorrect }: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showBack, setShowBack] = useState(false);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, number>>({});
  const [shuffledTerms, setShuffledTerms] = useState<Array<{term: string, originalIndex: number}>>([]);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<Array<{definition: string, originalIndex: number}>>([]);
  const [draggedDefinition, setDraggedDefinition] = useState<number | null>(null);
  const [dragOverTerm, setDragOverTerm] = useState<number | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOptions([]);
    setShowBack(false);
    setImageError({});
    setMatchingAnswers({});
    setDraggedDefinition(null);
    setDragOverTerm(null);
    
    // Shuffle matching pairs if it's a matching question
    if (question.type === 'matching') {
      const matchingQ = question as MatchingQuestion;
      const terms = matchingQ.pairs.map((pair, index) => ({ term: pair.term, originalIndex: index }));
      const definitions = matchingQ.pairs.map((pair, index) => ({ definition: pair.definition, originalIndex: index }));
      
      setShuffledTerms([...terms].sort(() => Math.random() - 0.5));
      setShuffledDefinitions([...definitions].sort(() => Math.random() - 0.5));
    }
  }, [question.id]);

  const handleImageError = (imageKey: string) => {
    setImageError(prev => ({ ...prev, [imageKey]: true }));
  };

  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    
    // Check for valid base64 image format
    if (url.startsWith('data:image/')) {
      const base64Part = url.split(',')[1];
      return base64Part && base64Part.length > 0;
    }
    
    // Check for valid HTTP/HTTPS URLs
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const renderImage = (imageUrl: string, altText: string, imageKey: string, className: string = '') => {
    if (!imageUrl || imageError[imageKey] || !isValidImageUrl(imageUrl)) {
      return null;
    }

    return (
      <div className={`relative ${className}`}>
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full h-auto rounded-lg shadow-md border border-gray-200"
          onError={() => handleImageError(imageKey)}
          loading="lazy"
        />
        {!altText && (
          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white p-1 rounded">
            <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const renderImagePlaceholder = (imageUrl: string, imageKey: string, label: string) => {
    if (!imageUrl) return null;
    
    if (!isValidImageUrl(imageUrl)) {
      return (
        <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded border border-amber-200">
          <svg className="h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Invalid {label}:</span> The image data appears to be corrupted or in an unsupported format.
        </div>
      );
    }
    
    if (imageError[imageKey]) {
      return (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
          <svg className="h-4 w-4 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Failed to load {label}</span>
        </div>
      );
    }
    
    return null;
  };

  const handleMultipleChoice = (optionIndex: number) => {
    if (showResult) return;
    onAnswer(optionIndex);
  };

  const handleTrueFalse = (optionIndex: number) => {
    if (showResult) return;
    onAnswer(optionIndex);
  };

  const handleSelectAll = (optionIndex: number) => {
    if (showResult) return;
    
    const newSelected = selectedOptions.includes(optionIndex)
      ? selectedOptions.filter(i => i !== optionIndex)
      : [...selectedOptions, optionIndex];
    
    setSelectedOptions(newSelected);
  };

  const submitSelectAll = () => {
    if (showResult) return;
    onAnswer(selectedOptions);
  };

  const handleMatching = (termIndex: number, definitionIndex: number) => {
    if (showResult) return;
    
    const newAnswers = { ...matchingAnswers };
    
    // Remove any existing mapping for this term
    delete newAnswers[termIndex];
    
    // Remove any existing mapping to this definition
    Object.keys(newAnswers).forEach(key => {
      if (newAnswers[parseInt(key)] === definitionIndex) {
        delete newAnswers[parseInt(key)];
      }
    });
    
    // Add new mapping
    newAnswers[termIndex] = definitionIndex;
    
    setMatchingAnswers(newAnswers);
  };

  const handleDragStart = (e: React.DragEvent, definitionIndex: number) => {
    if (showResult) return;
    setDraggedDefinition(definitionIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', definitionIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent, termIndex: number) => {
    if (showResult) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTerm(termIndex);
  };

  const handleDragLeave = () => {
    setDragOverTerm(null);
  };

  const handleDrop = (e: React.DragEvent, termIndex: number) => {
    if (showResult) return;
    e.preventDefault();
    const definitionIndex = parseInt(e.dataTransfer.getData('text/plain'));
    handleMatching(termIndex, definitionIndex);
    setDraggedDefinition(null);
    setDragOverTerm(null);
  };

  const handleDragEnd = () => {
    setDraggedDefinition(null);
    setDragOverTerm(null);
  };

  const submitMatching = () => {
    if (showResult) return;
    
    // Convert shuffled indices back to original indices
    const originalAnswers: Record<number, number> = {};
    Object.entries(matchingAnswers).forEach(([shuffledTermIdx, shuffledDefIdx]) => {
      const originalTermIdx = shuffledTerms[parseInt(shuffledTermIdx)].originalIndex;
      const originalDefIdx = shuffledDefinitions[shuffledDefIdx].originalIndex;
      originalAnswers[originalTermIdx] = originalDefIdx;
    });
    
    onAnswer(originalAnswers);
  };

  const renderMultipleChoice = (q: MultipleChoiceQuestion) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{q.question}</h3>
      
      {q.image && (
        <div className="mb-4">
          {renderImage(q.image, q.imageAlt || 'Question image', 'main-image')}
          {renderImagePlaceholder(q.image, 'main-image', 'question image')}
        </div>
      )}
      
      <div className="space-y-2">
        {q.options.map((option, index) => {
          const isSelected = userAnswer === index;
          const isCorrectOption = index === q.correctAnswer;
          let buttonClass = "w-full p-3 text-left rounded-lg border transition-all duration-200 ";
          
          if (showResult) {
            if (isCorrectOption) {
              buttonClass += "bg-green-100 border-green-300 text-green-800";
            } else if (isSelected && !isCorrectOption) {
              buttonClass += "bg-red-100 border-red-300 text-red-800";
            } else {
              buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
            }
          } else {
            buttonClass += "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
          }

          return (
            <button
              key={index}
              onClick={() => handleMultipleChoice(index)}
              className={buttonClass}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isCorrectOption && <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>}
                {showResult && isSelected && !isCorrectOption && <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>}
              </div>
            </button>
          );
        })}
      </div>
      {showResult && q.explanation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800"><strong>Explanation:</strong> {q.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderTrueFalse = (q: TrueFalseQuestion) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{q.question}</h3>
      
      {q.image && (
        <div className="mb-4">
          {renderImage(q.image, q.imageAlt || 'Question image', 'main-image')}
          {renderImagePlaceholder(q.image, 'main-image', 'question image')}
        </div>
      )}
      
      <div className="space-y-2">
        {q.options.map((option, index) => {
          const isSelected = userAnswer === index;
          const isCorrectOption = index === q.correctAnswer;
          let buttonClass = "w-full p-3 text-left rounded-lg border transition-all duration-200 ";
          
          if (showResult) {
            if (isCorrectOption) {
              buttonClass += "bg-green-100 border-green-300 text-green-800";
            } else if (isSelected && !isCorrectOption) {
              buttonClass += "bg-red-100 border-red-300 text-red-800";
            } else {
              buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
            }
          } else {
            buttonClass += "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
          }

          return (
            <button
              key={index}
              onClick={() => handleTrueFalse(index)}
              className={buttonClass}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isCorrectOption && <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>}
                {showResult && isSelected && !isCorrectOption && <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>}
              </div>
            </button>
          );
        })}
      </div>
      {showResult && q.explanation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800"><strong>Explanation:</strong> {q.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderSelectAll = (q: SelectAllQuestion) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{q.question}</h3>
      
      {q.image && (
        <div className="mb-4">
          {renderImage(q.image, q.imageAlt || 'Question image', 'main-image')}
          {renderImagePlaceholder(q.image, 'main-image', 'question image')}
        </div>
      )}
      
      <p className="text-sm text-gray-600 mb-3">Select all correct answers:</p>
      <div className="space-y-2">
        {q.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index) || (showResult && userAnswer?.includes(index));
          const isCorrectOption = q.correctAnswers.includes(index);
          let buttonClass = "w-full p-3 text-left rounded-lg border transition-all duration-200 ";
          
          if (showResult) {
            if (isCorrectOption) {
              buttonClass += "bg-green-100 border-green-300 text-green-800";
            } else if (isSelected && !isCorrectOption) {
              buttonClass += "bg-red-100 border-red-300 text-red-800";
            } else {
              buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
            }
          } else {
            buttonClass += isSelected 
              ? "bg-blue-100 border-blue-300 text-blue-800" 
              : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectAll(index)}
              className={buttonClass}
              disabled={showResult}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                <div className="flex items-center space-x-2">
                  {(isSelected || (showResult && userAnswer?.includes(index))) && (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      showResult && isCorrectOption ? 'bg-green-500 border-green-500' : 
                      showResult && !isCorrectOption ? 'bg-red-500 border-red-500' : 
                      'bg-blue-500 border-blue-500'
                    }`}>
                      <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {showResult && isCorrectOption && !userAnswer?.includes(index) && <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!showResult && selectedOptions.length > 0 && (
        <button
          onClick={submitSelectAll}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Submit Answer ({selectedOptions.length} selected)
        </button>
      )}
      {showResult && q.explanation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800"><strong>Explanation:</strong> {q.explanation}</p>
        </div>
      )}
    </div>
  );

  const renderFlashcard = (q: FlashcardQuestion) => (
    <div className="space-y-4">
      <div className="min-h-[300px] bg-white border-2 border-gray-200 rounded-lg p-6 flex flex-col justify-center items-center relative">
        {!showBack ? (
          <div className="text-center space-y-4 w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{q.front}</h3>
            {q.frontImage && (
              <div className="flex flex-col items-center space-y-2">
                {renderImage(q.frontImage, q.frontImageAlt || 'Front card image', 'front-image', 'max-w-sm mx-auto')}
                {renderImagePlaceholder(q.frontImage, 'front-image', 'front image')}
              </div>
            )}
            {q.hint && (
              <p className="text-sm text-gray-500 italic mt-4">Hint: {q.hint}</p>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 w-full">
            <h3 className="text-lg font-medium text-gray-800">{q.back}</h3>
            {q.backImage && (
              <div className="flex flex-col items-center space-y-2">
                {renderImage(q.backImage, q.backImageAlt || 'Back card image', 'back-image', 'max-w-sm mx-auto')}
                {renderImagePlaceholder(q.backImage, 'back-image', 'back image')}
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={() => setShowBack(!showBack)}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          {showBack ? (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => setShowBack(!showBack)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Flip Card
        </button>
      </div>

      {showBack && (
        <div className="flex justify-center space-x-3 mt-4">
          <button
            onClick={() => onAnswer(false)}
            className="flex items-center px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Hard
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="flex items-center px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
          >
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Easy
          </button>
        </div>
      )}
    </div>
  );

  const renderFactCard = (q: FactCardQuestion) => (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            {q.title && (
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{q.title}</h3>
            )}
            <p className="text-gray-800 leading-relaxed">{q.fact}</p>
            {q.source && (
              <p className="text-sm text-gray-600 mt-3 italic">Source: {q.source}</p>
            )}
          </div>
        </div>
        
        {q.factImage && (
          <div className="mt-4">
            {renderImage(q.factImage, q.factImageAlt || 'Fact illustration', 'fact-image')}
            {renderImagePlaceholder(q.factImage, 'fact-image', 'fact image')}
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={() => onAnswer(true)}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Got it!
        </button>
      </div>
    </div>
  );

  const renderMatching = (q: MatchingQuestion) => {
    const allTermsMatched = shuffledTerms.length > 0 && Object.keys(matchingAnswers).length === shuffledTerms.length;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{q.instruction}</h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 flex items-center">
            <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Drag definitions from the right column and drop them onto the matching terms in the left column.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Terms Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center">
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              Terms (Drop Zone)
            </h4>
            {shuffledTerms.map((item, shuffledIndex) => {
              const isMatched = matchingAnswers.hasOwnProperty(shuffledIndex);
              const matchedDefIndex = matchingAnswers[shuffledIndex];
              const isDragOver = dragOverTerm === shuffledIndex;
              
              let containerClass = "w-full p-4 rounded-lg border-2 transition-all duration-200 min-h-[80px] flex flex-col justify-center ";
              
              if (showResult) {
                const correctDefIndex = shuffledDefinitions.findIndex(def => def.originalIndex === item.originalIndex);
                const isCorrect = matchedDefIndex === correctDefIndex;
                
                if (isCorrect) {
                  containerClass += "bg-green-100 border-green-300 text-green-800";
                } else if (isMatched) {
                  containerClass += "bg-red-100 border-red-300 text-red-800";
                } else {
                  containerClass += "bg-gray-50 border-gray-200 text-gray-600";
                }
              } else {
                if (isDragOver) {
                  containerClass += "bg-blue-100 border-blue-400 border-dashed";
                } else if (isMatched) {
                  containerClass += "bg-green-50 border-green-300 text-green-800";
                } else {
                  containerClass += "bg-white border-gray-300 border-dashed hover:border-blue-300";
                }
              }

              return (
                <div
                  key={shuffledIndex}
                  className={containerClass}
                  onDragOver={(e) => handleDragOver(e, shuffledIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, shuffledIndex)}
                >
                  <div className="space-y-2">
                    <span className="font-semibold text-lg">{item.term}</span>
                    {isMatched && (
                      <div className="text-sm bg-white bg-opacity-70 p-2 rounded border">
                        <span className="text-gray-600">Matched with:</span>
                        <div className="font-medium mt-1">
                          {shuffledDefinitions[matchedDefIndex]?.definition}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center">
              <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Definitions (Drag These)
            </h4>
            {shuffledDefinitions.map((item, shuffledIndex) => {
              const isMatched = Object.values(matchingAnswers).includes(shuffledIndex);
              const isDragging = draggedDefinition === shuffledIndex;
              
              let buttonClass = "w-full p-3 text-left rounded-lg border transition-all duration-200 cursor-move ";
              
              if (showResult) {
                const matchingTermIndex = Object.keys(matchingAnswers).find(
                  key => matchingAnswers[parseInt(key)] === shuffledIndex
                );
                
                if (matchingTermIndex !== undefined) {
                  const termOriginalIndex = shuffledTerms[parseInt(matchingTermIndex)].originalIndex;
                  const isCorrect = termOriginalIndex === item.originalIndex;
                  
                  if (isCorrect) {
                    buttonClass += "bg-green-100 border-green-300 text-green-800";
                  } else {
                    buttonClass += "bg-red-100 border-red-300 text-red-800";
                  }
                } else {
                  buttonClass += "bg-gray-50 border-gray-200 text-gray-600";
                }
              } else {
                if (isDragging) {
                  buttonClass += "opacity-50 bg-blue-100 border-blue-300";
                } else if (isMatched) {
                  buttonClass += "bg-gray-100 border-gray-300 text-gray-600 opacity-75";
                } else {
                  buttonClass += "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300";
                }
              }

              return (
                <div
                  key={shuffledIndex}
                  className={buttonClass}
                  draggable={!showResult && !isMatched}
                  onDragStart={(e) => handleDragStart(e, shuffledIndex)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!showResult && isMatched) {
                      // Allow clicking to unmatch
                      const termIndex = Object.keys(matchingAnswers).find(
                        key => matchingAnswers[parseInt(key)] === shuffledIndex
                      );
                      if (termIndex) {
                        const newAnswers = { ...matchingAnswers };
                        delete newAnswers[parseInt(termIndex)];
                        setMatchingAnswers(newAnswers);
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.definition}</span>
                    {!showResult && (
                      <div className="flex items-center space-x-2">
                        {isMatched ? (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">Matched</span>
                        ) : (
                          <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!showResult && (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Matched: {Object.keys(matchingAnswers).length}/{shuffledTerms.length}
            </p>
            {allTermsMatched && (
              <button
                onClick={submitMatching}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Submit All Matches
              </button>
            )}
          </div>
        )}

        {showResult && q.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800"><strong>Explanation:</strong> {q.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
      {/* Question ID Display */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="font-mono">{question.id}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {question.type.replace('-', ' ').toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            {question.subject}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
            {question.topic}
          </span>
          {question.chapter && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              {question.chapter}
            </span>
          )}
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {question.difficulty.toUpperCase()}
        </div>
      </div>

      {question.type === 'multiple-choice' && renderMultipleChoice(question as MultipleChoiceQuestion)}
      {question.type === 'select-all' && renderSelectAll(question as SelectAllQuestion)}
      {question.type === 'true-false' && renderTrueFalse(question as TrueFalseQuestion)}
      {question.type === 'flashcard' && renderFlashcard(question as FlashcardQuestion)}
      {question.type === 'fact-card' && renderFactCard(question as FactCardQuestion)}
      {question.type === 'matching' && renderMatching(question as MatchingQuestion)}
    </div>
  );
}
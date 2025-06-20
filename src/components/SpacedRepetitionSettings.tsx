import React, { useState } from 'react';
import { SpacedRepetitionSettings } from '../types/Question';
import { Settings, Clock, Brain, RotateCcw, Save, X, Info, Target } from 'lucide-react';

interface SpacedRepetitionSettingsProps {
  settings: SpacedRepetitionSettings;
  onSave: (settings: SpacedRepetitionSettings) => void;
  onClose: () => void;
}

export function SpacedRepetitionSettingsComponent({ settings, onSave, onClose }: SpacedRepetitionSettingsProps) {
  const [localSettings, setLocalSettings] = useState<SpacedRepetitionSettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultSettings: SpacedRepetitionSettings = {
    firstReviewHours: 24,
    secondReviewHours: 144,
    incorrectReviewHours: 1,
    minEaseFactor: 1.3,
    easeFactorIncrement: 0.1,
    easeFactorDecrement: 0.2,
    masteryThreshold: 3
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  const formatHours = (hours: number): string => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours < 168) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (remainingHours === 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
      } else {
        return `${days}d ${remainingHours}h`;
      }
    } else {
      const weeks = Math.floor(hours / 168);
      const remainingDays = Math.floor((hours % 168) / 24);
      if (remainingDays === 0) {
        return `${weeks} week${weeks !== 1 ? 's' : ''}`;
      } else {
        return `${weeks}w ${remainingDays}d`;
      }
    }
  };

  const updateSetting = (key: keyof SpacedRepetitionSettings, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-6 w-6 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Spaced Repetition Settings</h2>
                <p className="text-indigo-100 text-sm">Customize your review schedule timing and mastery criteria</p>
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
          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium mb-1">How Spaced Repetition Works</p>
                <p className="text-blue-700">
                  These settings control when questions appear for review and when they're considered mastered. 
                  The spaced repetition algorithm schedules reviews at increasing intervals to optimize long-term retention. 
                  Adjust these timings based on your learning preferences and schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Settings */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                Review Timing
              </h3>

              {/* First Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    First Review (after 1st correct answer)
                  </label>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatHours(localSettings.firstReviewHours)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={localSettings.firstReviewHours}
                  onChange={(e) => updateSetting('firstReviewHours', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 hour</span>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={localSettings.firstReviewHours}
                    onChange={(e) => updateSetting('firstReviewHours', Math.max(1, Math.min(168, parseInt(e.target.value) || 1)))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                  />
                  <span>1 week</span>
                </div>
              </div>

              {/* Second Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Second Review (after 2nd correct answer)
                  </label>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatHours(localSettings.secondReviewHours)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="720"
                  value={localSettings.secondReviewHours}
                  onChange={(e) => updateSetting('secondReviewHours', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 hour</span>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={localSettings.secondReviewHours}
                    onChange={(e) => updateSetting('secondReviewHours', Math.max(1, Math.min(720, parseInt(e.target.value) || 1)))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                  />
                  <span>30 days</span>
                </div>
              </div>

              {/* Incorrect Review */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Incorrect Answer Review
                  </label>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatHours(localSettings.incorrectReviewHours)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="24"
                  step="0.25"
                  value={localSettings.incorrectReviewHours}
                  onChange={(e) => updateSetting('incorrectReviewHours', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>15 min</span>
                  <input
                    type="number"
                    min="0.25"
                    max="24"
                    step="0.25"
                    value={localSettings.incorrectReviewHours}
                    onChange={(e) => updateSetting('incorrectReviewHours', Math.max(0.25, Math.min(24, parseFloat(e.target.value) || 0.25)))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                  />
                  <span>1 day</span>
                </div>
              </div>

              {/* Mastery Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Mastery Threshold (consecutive correct answers)
                  </label>
                  <span className="text-sm text-gray-500 font-mono">
                    {localSettings.masteryThreshold} correct
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={localSettings.masteryThreshold}
                  onChange={(e) => updateSetting('masteryThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>2 correct</span>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={localSettings.masteryThreshold}
                    onChange={(e) => updateSetting('masteryThreshold', Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-xs"
                  />
                  <span>10 correct</span>
                </div>
                <p className="text-xs text-gray-600">
                  Questions are considered mastered after this many consecutive correct answers
                </p>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  Advanced Settings
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-6">
                  {/* Min Ease Factor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Minimum Ease Factor
                      </label>
                      <span className="text-sm text-gray-500 font-mono">
                        {localSettings.minEaseFactor.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.0"
                      step="0.1"
                      value={localSettings.minEaseFactor}
                      onChange={(e) => updateSetting('minEaseFactor', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1.0</span>
                      <span>2.0</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Lower values make difficult questions appear more frequently
                    </p>
                  </div>

                  {/* Ease Factor Increment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Ease Factor Increase (correct answers)
                      </label>
                      <span className="text-sm text-gray-500 font-mono">
                        +{localSettings.easeFactorIncrement.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.3"
                      step="0.05"
                      value={localSettings.easeFactorIncrement}
                      onChange={(e) => updateSetting('easeFactorIncrement', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.05</span>
                      <span>0.30</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      How much easier questions become when answered correctly
                    </p>
                  </div>

                  {/* Ease Factor Decrement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Ease Factor Decrease (incorrect answers)
                      </label>
                      <span className="text-sm text-gray-500 font-mono">
                        -{localSettings.easeFactorDecrement.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.5"
                      step="0.05"
                      value={localSettings.easeFactorDecrement}
                      onChange={(e) => updateSetting('easeFactorDecrement', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.10</span>
                      <span>0.50</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      How much harder questions become when answered incorrectly
                    </p>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Settings Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">1st correct answer:</span>
                    <span className="font-medium text-green-700">
                      Review in {formatHours(localSettings.firstReviewHours)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">2nd correct answer:</span>
                    <span className="font-medium text-blue-700">
                      Review in {formatHours(localSettings.secondReviewHours)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Incorrect answer:</span>
                    <span className="font-medium text-red-700">
                      Review in {formatHours(localSettings.incorrectReviewHours)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mastery threshold:</span>
                      <span className="font-medium text-purple-700">
                        {localSettings.masteryThreshold} consecutive correct answers
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">3rd+ correct answers:</span>
                    <span className="font-medium text-indigo-700">
                      Increasing intervals based on ease factor
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Presets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setLocalSettings({
                  firstReviewHours: 4,
                  secondReviewHours: 24,
                  incorrectReviewHours: 0.5,
                  minEaseFactor: 1.3,
                  easeFactorIncrement: 0.1,
                  easeFactorDecrement: 0.2,
                  masteryThreshold: 2
                })}
                className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200 text-left"
              >
                <h5 className="font-medium text-red-900 mb-1">Intensive</h5>
                <p className="text-sm text-red-700">Frequent reviews for rapid learning</p>
                <p className="text-xs text-red-600 mt-2">4h → 24h → increasing • 2 correct for mastery</p>
              </button>

              <button
                onClick={() => setLocalSettings(defaultSettings)}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-left"
              >
                <h5 className="font-medium text-blue-900 mb-1">Balanced</h5>
                <p className="text-sm text-blue-700">Standard spaced repetition timing</p>
                <p className="text-xs text-blue-600 mt-2">24h → 144h → increasing • 3 correct for mastery</p>
              </button>

              <button
                onClick={() => setLocalSettings({
                  firstReviewHours: 48,
                  secondReviewHours: 336,
                  incorrectReviewHours: 2,
                  minEaseFactor: 1.3,
                  easeFactorIncrement: 0.15,
                  easeFactorDecrement: 0.15,
                  masteryThreshold: 5
                })}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200 text-left"
              >
                <h5 className="font-medium text-green-900 mb-1">Thorough</h5>
                <p className="text-sm text-green-700">Longer intervals with higher mastery bar</p>
                <p className="text-xs text-green-600 mt-2">48h → 336h → increasing • 5 correct for mastery</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
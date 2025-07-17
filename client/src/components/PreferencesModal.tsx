import React, { useState } from 'react';

interface PreferencesModalProps {
  currentPreferences?: string[]; // Make this optional
  onSave: (preferences: string[]) => void;
  onClose: () => void;
}

const categories = [
  'technology', 'health', 'sports',
  'entertainment', 'politics', 'space'
];

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  currentPreferences = [], 
  onSave,
  onClose
}) => {
  const [preferences, setPreferences] = useState<string[]>(currentPreferences);

  const handleTogglePreference = (category: string) => {
    setPreferences(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(preferences);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Your Preferences</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {categories.map(category => (
              <label key={category} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={preferences.includes(category)}
                  onChange={() => handleTogglePreference(category)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-gray-700 capitalize">{category}</span>
              </label>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreferencesModal;
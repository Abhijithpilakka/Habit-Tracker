import React from 'react';
import { Archive } from 'lucide-react';

export default function DeleteConfirmModal({ habit, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <Archive className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Archive Habit?</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your progress will be saved</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4">
          <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200">
            <strong>"{habit.name}"</strong> will be moved to archives. All your progress and data will be preserved. You can restore it anytime from the Archived section.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-orange-600 text-white py-2 sm:py-3 rounded-lg hover:bg-orange-700 font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>

          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 sm:py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
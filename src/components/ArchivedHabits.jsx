import React from 'react';
import { RotateCcw, X, Archive } from 'lucide-react';

export default function ArchivedHabits({ habits, onUnarchive, onPermanentDelete, getCategoryColor }) {
  const permanentlyDeleteHabit = (habitId, habitName) => {
    if (!confirm(`⚠️ This will PERMANENTLY delete "${habitName}" and all its data. This cannot be undone. Are you sure?`)) {
      return;
    }
    onPermanentDelete(habitId);
  };

  return (
    <div className="space-y-3">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Archived Habits</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your archived habits are preserved here. Restore them anytime or delete permanently.
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No archived habits.</p>
          <p className="text-sm mt-2">Archived habits will appear here with all their progress preserved.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{habit.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(habit.category)}`}>
                      {habit.category}
                    </span>
                    {habit.archivedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Archived {new Date(habit.archivedAt.toDate()).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onUnarchive(habit.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                    title="Restore habit"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    onClick={() => permanentlyDeleteHabit(habit.id, habit.name)}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
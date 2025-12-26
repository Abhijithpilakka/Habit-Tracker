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
<div className="mb-4 sm:mb-6">
<h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">Archived Habits</h2>
<p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
Your archived habits are preserved here. Restore them anytime or delete permanently.
</p>
</div>
  {habits.length === 0 ? (
    <div className="text-center py-8 sm:py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
      <Archive className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
      <p className="text-sm sm:text-base">No archived habits.</p>
      <p className="text-xs sm:text-sm mt-2 px-4">Archived habits will appear here with all their progress preserved.</p>
    </div>
  ) : (
    <div className="space-y-3">
      {habits.map(habit => (
        <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white truncate">{habit.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(habit.category)}`}>
                  {habit.category}
                </span>
                {habit.archivedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Archived {new Date(habit.archivedAt.toDate()).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => onUnarchive(habit.id)}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-xs sm:text-sm"
                title="Restore habit"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Restore</span>
              </button>
              <button
                onClick={() => permanentlyDeleteHabit(habit.id, habit.name)}
                className="p-1.5 sm:p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete permanently"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
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
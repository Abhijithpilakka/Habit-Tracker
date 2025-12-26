import React from 'react';
import { Flame, Archive } from 'lucide-react';

export default function HabitCard({ habit, onToggle, onArchive, selectedDate, calculateStreak, getCategoryColor }) {
  const { currentStreak } = calculateStreak(habit);
  const isCompleted = habit.logs[selectedDate];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={() => onToggle(habit.id, selectedDate)}
            className="flex-shrink-0"
          >
            {isCompleted ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"></div>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm sm:text-base truncate ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-white'}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(habit.category)}`}>
                {habit.category}
              </span>
              {currentStreak > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                  <Flame className="w-3 h-3" />
                  {currentStreak}d
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onArchive(habit)}
          className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 p-1.5 sm:p-2 flex-shrink-0"
          title="Archive habit"
        >
          <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
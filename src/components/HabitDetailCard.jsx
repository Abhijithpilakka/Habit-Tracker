import React from 'react';
import { Flame, Archive } from 'lucide-react';

export default function HabitDetailCard({ habit, onArchive, calculateStreak, getCompletionRate, getLast7Days, getCategoryColor }) {
  const { currentStreak, longestStreak } = calculateStreak(habit);
  const completionRate = getCompletionRate(habit);
  const last7Days = getLast7Days();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800 dark:text-white">{habit.name}</h3>
          <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${getCategoryColor(habit.category)}`}>
            {habit.category}
          </span>
        </div>
        <button
          onClick={() => onArchive(habit)}
          className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
          title="Archive habit"
        >
          <Archive className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {currentStreak}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Current Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{longestStreak}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Longest Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completionRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">30-Day Rate</div>
        </div>
      </div>

      <div className="flex gap-1">
        {last7Days.map(date => {
          const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const isCompleted = habit.logs[date];
          
          return (
            <div key={date} className="flex-1 text-center">
              <div className={`h-8 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{day}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
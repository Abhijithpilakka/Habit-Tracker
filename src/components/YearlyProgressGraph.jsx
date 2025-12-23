import React from 'react';

export default function YearlyProgressGraph({ habits }) {
  const getYearData = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      let completedCount = 0;
      let totalHabits = 0;
      
      habits.forEach(habit => {
        if (dateStr >= habit.createdDate) {
          totalHabits++;
          if (habit.logs[dateStr]) {
            completedCount++;
          }
        }
      });
      
      const completionRate = totalHabits > 0 ? (completedCount / totalHabits) : 0;
      
      currentWeek.push({
        date: dateStr,
        completionRate,
        completedCount,
        totalHabits,
        dayOfWeek: date.getDay()
      });
      
      if (date.getDay() === 6 || i === 364) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    return weeks;
  };

  const getIntensityColor = (rate) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (rate < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (rate < 0.5) return 'bg-green-300 dark:bg-green-800';
    if (rate < 0.75) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-600';
  };

  const weeks = getYearData();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Yearly Progress</h3>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
            <div className="w-3 h-3 bg-green-200 dark:bg-green-900 rounded"></div>
            <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded"></div>
            <div className="w-3 h-3 bg-green-400 dark:bg-green-700 rounded"></div>
            <div className="w-3 h-3 bg-green-600 dark:bg-green-600 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 pr-2">
            <div className="h-3"></div>
            {days.map((day, i) => (
              <div key={day} className="h-3 flex items-center">
                {i % 2 === 1 && day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {weekIndex === 0 || (week[0] && new Date(week[0].date).getDate() <= 7) ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 h-3">
                  {week[0] && months[new Date(week[0].date).getMonth()]}
                </div>
              ) : (
                <div className="h-3"></div>
              )}
              
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayData = week.find(d => d && d.dayOfWeek === dayIndex);
                
                if (!dayData) {
                  return <div key={dayIndex} className="w-3 h-3"></div>;
                }

                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(dayData.completionRate)} hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all`}
                    title={`${dayData.date}: ${dayData.completedCount}/${dayData.totalHabits} habits completed`}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Track your consistency throughout the year. Each square represents a day.
      </div>
    </div>
  );
}
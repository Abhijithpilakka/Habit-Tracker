import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { Plus, X, Flame, CheckCircle2, Circle, TrendingUp, Calendar } from 'lucide-react';

export default function HabitTracker({ userId }) {
  const [habits, setHabits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('today');
  const [loading, setLoading] = useState(true);

  // Real-time listener for habits
  useEffect(() => {
    const q = query(collection(db, 'habits'), where('userId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHabits(habitsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addHabit = async () => {
    if (newHabitName.trim()) {
      try {
        await addDoc(collection(db, 'habits'), {
          userId,
          name: newHabitName.trim(),
          category: newHabitCategory,
          createdDate: new Date().toISOString().split('T')[0],
          logs: {},
          createdAt: serverTimestamp()
        });
        setNewHabitName('');
        setShowAddModal(false);
      } catch (error) {
        console.error('Error adding habit:', error);
      }
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const toggleHabit = async (habitId, date) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      const newLogs = { ...habit.logs };
      newLogs[date] = !newLogs[date];
      
      await updateDoc(doc(db, 'habits', habitId), {
        logs: newLogs
      });
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const calculateStreak = (habit) => {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (habit.logs[dateStr]) {
        tempStreak++;
        if (i === 0 || habit.logs[new Date(today.getTime() - (i-1) * 86400000).toISOString().split('T')[0]]) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  };

  const getCompletionRate = (habit, days = 30) => {
    const today = new Date();
    let completed = 0;
    let total = 0;

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dateStr >= habit.createdDate) {
        total++;
        if (habit.logs[dateStr]) completed++;
      }
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Health: 'bg-green-100 text-green-700',
      Productivity: 'bg-blue-100 text-blue-700',
      Learning: 'bg-purple-100 text-purple-700',
      Social: 'bg-pink-100 text-pink-700',
      Fitness: 'bg-orange-100 text-orange-700',
      Mindfulness: 'bg-teal-100 text-teal-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // NEW: GitHub-style contribution graph
  const YearlyProgressGraph = () => {
    const getYearData = () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 364); // Last 365 days
      
      const weeks = [];
      let currentWeek = [];
      
      for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Calculate completion percentage for this day across all habits
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
        
        // Start new week on Sunday (day 0)
        if (date.getDay() === 6 || i === 364) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
      
      return weeks;
    };

    const getIntensityColor = (rate) => {
      if (rate === 0) return 'bg-gray-100';
      if (rate < 0.25) return 'bg-green-200';
      if (rate < 0.5) return 'bg-green-300';
      if (rate < 0.75) return 'bg-green-400';
      return 'bg-green-600';
    };

    const weeks = getYearData();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800">Yearly Progress</h3>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <div className="w-3 h-3 bg-green-600 rounded"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 pr-2">
              <div className="h-3"></div>
              {days.map((day, i) => (
                <div key={day} className="h-3 flex items-center">
                  {i % 2 === 1 && day}
                </div>
              ))}
            </div>

            {/* Contribution grid */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {/* Month labels */}
                {weekIndex === 0 || (week[0] && new Date(week[0].date).getDate() <= 7) ? (
                  <div className="text-xs text-gray-500 h-3">
                    {week[0] && months[new Date(week[0].date).getMonth()]}
                  </div>
                ) : (
                  <div className="h-3"></div>
                )}
                
                {/* Days in week */}
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

        <div className="mt-4 text-sm text-gray-600">
          Track your consistency throughout the year. Each square represents a day.
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600">Loading your habits...</div>
      </div>
    );
  }

  const TodayView = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold mb-6">Today's Habits</h2>
      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Circle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No habits yet. Add your first habit to get started!</p>
        </div>
      ) : (
        habits.map(habit => {
          const { currentStreak } = calculateStreak(habit);
          const isCompleted = habit.logs[selectedDate];
          
          return (
            <div key={habit.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleHabit(habit.id, selectedDate)}
                    className="flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    ) : (
                      <Circle className="w-8 h-8 text-gray-300 hover:text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(habit.category)}`}>
                        {habit.category}
                      </span>
                      {currentStreak > 0 && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Flame className="w-3 h-3" />
                          {currentStreak} day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const DashboardView = () => {
    const last7Days = getLast7Days();
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Total Habits</div>
            <div className="text-4xl font-bold">{habits.length}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Completed Today</div>
            <div className="text-4xl font-bold">
              {habits.filter(h => h.logs[selectedDate]).length}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-1">Active Streaks</div>
            <div className="text-4xl font-bold">
              {habits.filter(h => calculateStreak(h).currentStreak > 0).length}
            </div>
          </div>
        </div>

        {/* NEW: Yearly Progress Graph */}
        <YearlyProgressGraph />

        {habits.map(habit => {
          const { currentStreak, longestStreak } = calculateStreak(habit);
          const completionRate = getCompletionRate(habit);
          
          return (
            <div key={habit.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{habit.name}</h3>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${getCategoryColor(habit.category)}`}>
                    {habit.category}
                  </span>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" />
                    {currentStreak}
                  </div>
                  <div className="text-xs text-gray-500">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{longestStreak}</div>
                  <div className="text-xs text-gray-500">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                  <div className="text-xs text-gray-500">30-Day Rate</div>
                </div>
              </div>

              <div className="flex gap-1">
                {last7Days.map(date => {
                  const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                  const isCompleted = habit.logs[date];
                  
                  return (
                    <div key={date} className="flex-1 text-center">
                      <div className={`h-8 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <div className="text-xs text-gray-500 mt-1">{day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Today
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      {view === 'today' ? <TodayView /> : <DashboardView />}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Habit</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning workout"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Health</option>
                  <option>Fitness</option>
                  <option>Productivity</option>
                  <option>Learning</option>
                  <option>Social</option>
                  <option>Mindfulness</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={addHabit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Add Habit
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewHabitName('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
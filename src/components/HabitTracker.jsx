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
import { Plus, CheckCircle2, TrendingUp, Moon, Sun, Sparkles, Archive } from 'lucide-react';
import HabitTemplates from './HabitTemplates';
import YearlyProgressGraph from './YearlyProgressGraph';
import HabitCard from './HabitCard';
import HabitDetailCard from './HabitDetailCard';
import ArchivedHabits from './ArchivedHabits';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useTheme } from '../context/ThemeContext';

export default function HabitTracker({ userId }) {
  const [habits, setHabits] = useState([]);
  const [allHabits, setAllHabits] = useState([]); // For yearly graph - includes archived
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState('today');
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  // Real-time listener for active habits
  useEffect(() => {
    const q = query(
      collection(db, 'habits'), 
      where('userId', '==', userId),
      where('archived', '==', false)
    );
    
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

  // Real-time listener for ALL habits (including archived) for yearly graph
  useEffect(() => {
    const q = query(
      collection(db, 'habits'), 
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllHabits(habitsData);
    });

    return () => unsubscribe();
  }, [userId]);

  // Real-time listener for archived habits
  useEffect(() => {
    const q = query(
      collection(db, 'habits'), 
      where('userId', '==', userId),
      where('archived', '==', true)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArchivedHabits(habitsData);
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
          archived: false,
          createdAt: serverTimestamp()
        });
        setNewHabitName('');
        setShowAddModal(false);
      } catch (error) {
        console.error('Error adding habit:', error);
      }
    }
  };

  const addHabitsFromTemplate = async (templateHabits) => {
    try {
      const promises = templateHabits.map(habit =>
        addDoc(collection(db, 'habits'), {
          userId,
          name: habit.name,
          category: habit.category,
          createdDate: new Date().toISOString().split('T')[0],
          logs: {},
          archived: false,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(promises);
      alert(`Successfully added ${templateHabits.length} habits!`);
    } catch (error) {
      console.error('Error adding template habits:', error);
      alert('Error adding habits from template');
    }
  };

  const confirmArchiveHabit = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteConfirm(true);
  };

  const archiveHabit = async () => {
    if (!habitToDelete) return;
    
    try {
      await updateDoc(doc(db, 'habits', habitToDelete.id), {
        archived: true,
        archivedAt: serverTimestamp()
      });
      setShowDeleteConfirm(false);
      setHabitToDelete(null);
    } catch (error) {
      console.error('Error archiving habit:', error);
      alert('Error archiving habit');
    }
  };

  const unarchiveHabit = async (habitId) => {
    try {
      await updateDoc(doc(db, 'habits', habitId), {
        archived: false,
        archivedAt: null
      });
    } catch (error) {
      console.error('Error unarchiving habit:', error);
      alert('Error restoring habit');
    }
  };

  const permanentlyDeleteHabit = async (habitId) => {
    try {
      await deleteDoc(doc(db, 'habits', habitId));
    } catch (error) {
      console.error('Error permanently deleting habit:', error);
      alert('Error deleting habit');
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
      Health: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      Productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      Learning: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      Social: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      Fitness: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      Mindfulness: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading your habits...</div>
      </div>
    );
  }

  if (showArchivedView) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowArchivedView(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Habits
          </button>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <ArchivedHabits
          habits={archivedHabits}
          onUnarchive={unarchiveHabit}
          onPermanentDelete={permanentlyDeleteHabit}
          getCategoryColor={getCategoryColor}
        />
      </>
    );
  }

  const TodayView = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Today's Habits</h2>
      {habits.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No habits yet. Add your first habit or try a template!</p>
        </div>
      ) : (
        habits.map(habit => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={toggleHabit}
            onArchive={confirmArchiveHabit}
            selectedDate={selectedDate}
            calculateStreak={calculateStreak}
            getCategoryColor={getCategoryColor}
          />
        ))
      )}
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Active Habits</div>
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

      <YearlyProgressGraph habits={allHabits} />

      {habits.map(habit => (
        <HabitDetailCard
          key={habit.id}
          habit={habit}
          onArchive={confirmArchiveHabit}
          calculateStreak={calculateStreak}
          getCompletionRate={getCompletionRate}
          getLast7Days={getLast7Days}
          getCategoryColor={getCategoryColor}
        />
      ))}
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setView('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'today' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Today
          </button>
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setShowArchivedView(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archived ({archivedHabits.length})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {view === 'today' ? <TodayView /> : <DashboardView />}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showTemplates && (
        <HabitTemplates
          onSelectTemplate={addHabitsFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showDeleteConfirm && habitToDelete && (
        <DeleteConfirmModal
          habit={habitToDelete}
          onConfirm={archiveHabit}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setHabitToDelete(null);
          }}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Add New Habit</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning workout"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add Habit
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewHabitName('');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
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
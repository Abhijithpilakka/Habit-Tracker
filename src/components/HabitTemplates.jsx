import React, { useState } from 'react';
import { Sparkles, Dumbbell, Book, Briefcase, Heart, Brain, X } from 'lucide-react';

const HABIT_TEMPLATES = [
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    icon: Sparkles,
    color: 'from-yellow-400 to-orange-500',
    description: 'Start your day right',
    habits: [
      { name: 'Wake up at 6 AM', category: 'Health' },
      { name: 'Drink water', category: 'Health' },
      { name: 'Morning meditation', category: 'Mindfulness' },
      { name: 'Exercise', category: 'Fitness' },
      { name: 'Healthy breakfast', category: 'Health' }
    ]
  },
  {
    id: 'fitness-journey',
    name: 'Fitness Journey',
    icon: Dumbbell,
    color: 'from-red-500 to-pink-500',
    description: 'Build a strong body',
    habits: [
      { name: 'Workout 30 minutes', category: 'Fitness' },
      { name: 'Drink 8 glasses of water', category: 'Health' },
      { name: 'Track calories', category: 'Health' },
      { name: 'Stretch', category: 'Fitness' },
      { name: 'Get 8 hours sleep', category: 'Health' }
    ]
  },
  {
    id: 'learning-path',
    name: 'Learning Path',
    icon: Book,
    color: 'from-blue-500 to-purple-500',
    description: 'Continuous growth',
    habits: [
      { name: 'Read 30 pages', category: 'Learning' },
      { name: 'Online course lesson', category: 'Learning' },
      { name: 'Practice coding', category: 'Learning' },
      { name: 'Learn new vocabulary', category: 'Learning' },
      { name: 'Write a summary', category: 'Learning' }
    ]
  },
  {
    id: 'productivity-boost',
    name: 'Productivity Boost',
    icon: Briefcase,
    color: 'from-green-500 to-teal-500',
    description: 'Get things done',
    habits: [
      { name: 'Plan the day', category: 'Productivity' },
      { name: 'Deep work session', category: 'Productivity' },
      { name: 'No social media before noon', category: 'Productivity' },
      { name: 'Review daily progress', category: 'Productivity' },
      { name: 'Inbox zero', category: 'Productivity' }
    ]
  },
  {
    id: 'mental-wellness',
    name: 'Mental Wellness',
    icon: Brain,
    color: 'from-purple-500 to-indigo-500',
    description: 'Peace of mind',
    habits: [
      { name: 'Meditation', category: 'Mindfulness' },
      { name: 'Journaling', category: 'Mindfulness' },
      { name: 'Gratitude practice', category: 'Mindfulness' },
      { name: 'No phone 1 hour before bed', category: 'Mindfulness' },
      { name: 'Connect with loved ones', category: 'Social' }
    ]
  },
  {
    id: 'social-connection',
    name: 'Social Connection',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    description: 'Build relationships',
    habits: [
      { name: 'Call a friend', category: 'Social' },
      { name: 'Quality time with family', category: 'Social' },
      { name: 'Send a thoughtful message', category: 'Social' },
      { name: 'Make someone smile', category: 'Social' },
      { name: 'Practice active listening', category: 'Social' }
    ]
  }
];

export default function HabitTemplates({ onSelectTemplate, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.habits);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Templates</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Choose a template to quickly add multiple habits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {HABIT_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {template.habits.length} habits
                  </div>
                </button>
              );
            })}
          </div>

          {selectedTemplate && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white mb-4">
                Habits in "{selectedTemplate.name}" template:
              </h3>
              <div className="space-y-2 mb-6">
                {selectedTemplate.habits.map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-800 dark:text-white font-medium">{habit.name}</span>
                    <span className="ml-auto text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {habit.category}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleUseTemplate}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add All {selectedTemplate.habits.length} Habits
                </button>
                <button
                  onClick={onClose}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
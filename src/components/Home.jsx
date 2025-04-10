import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="overflow-y-auto flex-1 p-4 pt-0 bg-gray-200 dark:bg-darkbg">
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Climate Impact</h2>
            <span className="text-md bg-primary/10 text-primary px-3 py-1 rounded-full">Level {currentUser?.level}</span>
          </div>
          <div className="mt-4 flex flex-col md:flex-row items-center gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 w-6/10 rounded-lg text-center flex-1">
              <p className="text-md text-gray-500 dark:text-gray-400">Carbon Footprint</p>
              <p className="text-2xl font-bold">{currentUser?.footprint?.toFixed(1) || '0.0'} tons</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">CO₂ per year</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 w-6/10 rounded-lg text-center flex-1">
              <p className="text-md text-gray-500 dark:text-gray-400">Eco Points</p>
              <p className="text-2xl font-bold">{currentUser?.points || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">From {currentUser?.actions || 0} actions</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 w-8/10 rounded-lg text-center flex-1">
              <p className="text-md text-gray-500 dark:text-gray-400">Next Level</p>
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div className="bg-primary h-2.5 rounded-full" style={{width: `${(currentUser?.points % 100) / 100 * 100}%`}}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{currentUser?.points % 100}/100 points</p>
            </div>
          </div>
        </div>

        {/* Recent Climate News */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Recent Climate News</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-secondary p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
              <h3 className="font-bold">New Study Shows Hope for Climate Action</h3>
              <p className="text-md">Renewable energy adoption is accelerating faster than predicted</p>
            </div>
            <div className="border-l-4 border-yellow-500 p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20">
              <h3 className="font-bold">Climate Summit Approaching</h3>
              <p className="text-md">World leaders will meet next month to discuss emission targets</p>
            </div>
          </div>
          <button className="mt-4 text-primary font-semibold text-md">View all news →</button>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white dark:bg-darkcard rounded-lg shadow p-4">
          <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentUser?.achievements?.slice(0, 4).map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-4xl mb-2 block">{achievement.icon}</span>
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-md text-gray-600 dark:text-gray-400">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

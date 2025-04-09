import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-primary/10 dark:bg-primary/5 rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome back, {currentUser?.displayName}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your journey to combat climate change starts here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Carbon Footprint</h3>
          <p className="text-3xl font-bold text-primary">
            {currentUser?.footprint?.toFixed(1) || '0.0'} <span className="text-sm">tons/year</span>
          </p>
        </div>
        
        <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Eco Points</h3>
          <p className="text-3xl font-bold text-primary">
            {currentUser?.points || 0}
          </p>
        </div>

        <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Level</h3>
          <p className="text-3xl font-bold text-primary">
            {currentUser?.level || 1}
          </p>
        </div>

        <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Actions Taken</h3>
          <p className="text-3xl font-bold text-primary">
            {currentUser?.actions || 0}
          </p>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white dark:bg-darkcard p-6 rounded-lg shadow mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentUser?.achievements?.slice(0, 4).map((achievement, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-4xl mb-2 block">{achievement.icon}</span>
              <h4 className="font-semibold">{achievement.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

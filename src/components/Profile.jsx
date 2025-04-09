import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { currentUser } = useAuth();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-darkcard rounded-lg shadow-lg p-8">
        {/* Profile Header */}
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={currentUser?.photoURL || 'https://i.imgur.com/HYsTHOF.png'}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{currentUser?.displayName}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Member since {formatDate(currentUser?.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Carbon Footprint</h3>
            <p className="text-3xl font-bold text-primary">
              {currentUser?.footprint?.toFixed(1) || '0.0'}
              <span className="text-base font-normal text-gray-600 dark:text-gray-400"> tons/year</span>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Eco Points</h3>
            <p className="text-3xl font-bold text-primary">
              {currentUser?.points || 0}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Climate Actions</h3>
            <p className="text-3xl font-bold text-primary">
              {currentUser?.actions || 0}
            </p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Level Progress</h2>
          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{
                width: `${Math.min(((currentUser?.points || 0) % 100) / 100 * 100, 100)}%`
              }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Level {Math.floor((currentUser?.points || 0) / 100) + 1}
          </p>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentUser?.achievements?.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-600 dark:text-gray-400 col-span-2">
                No achievements yet. Start taking climate action to earn badges!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Calculator() {
  const { currentUser } = useAuth();
  const [footprintData, setFootprintData] = useState({
    transport: 3,
    food: 2.5,
    energy: 1.7,
    goods: 1
  });
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
      if(currentUser) {
        setFootprintData({
          transport: currentUser?.transport || 3,
          food: currentUser?.food || 2.5,
          energy: currentUser?.energy || 1.7,
          goods: currentUser?.goods || 1
        })
      }
  },[currentUser])

  const updateFootprint = (category, value) => {
    setFootprintData(prev => ({
      ...prev,
      [category]: parseFloat(value)
    }));
  };

  const calculateFootprint = () => {
    return Object.values(footprintData).reduce((sum, value) => sum + value, 0);
  };

  const generateRecommendations = (footprint) => {
    if (footprint > 10) {
      return [
        "Consider using public transportation more frequently",
        "Reduce meat consumption to 2-3 times per week",
        "Switch to energy-efficient appliances",
        "Improve home insulation to reduce heating/cooling needs"
      ];
    } else if (footprint > 5) {
      return [
        "Try carpooling or biking for shorter commutes",
        "Consider a partially plant-based diet",
        "Install smart thermostats or timers",
        "Reduce air travel when possible"
      ];
    } else {
      return [
        "Great job! Consider volunteering for local environmental initiatives",
        "Look into community solar projects",
        "Share your sustainable practices with friends and family",
        "Explore zero-waste shopping options"
      ];
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-darkbg p-4">
      <div className="bg-white dark:bg-darkcard rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Your Carbon Footprint</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/2">
            <div className="relative pt-1">
              <p className="text-sm font-medium mb-1">Transportation <span className="float-right">{footprintData.transport} tons</span></p>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={footprintData.transport}
                onChange={(e) => updateFootprint("transport", e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="relative pt-4">
              <p className="text-sm font-medium mb-1">Food & Diet <span className="float-right">{footprintData.food} tons</span></p>
              <input
                type="range"
                min="0"
                max="7"
                step="0.1"
                value={footprintData.food}
                onChange={(e) => updateFootprint("food", e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="relative pt-4">
              <p className="text-sm font-medium mb-1">Home Energy <span className="float-right">{footprintData.energy} tons</span></p>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={footprintData.energy}
                onChange={(e) => updateFootprint("energy", e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="relative pt-4">
              <p className="text-sm font-medium mb-1">Goods & Services <span className="float-right">{footprintData.goods} tons</span></p>
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={footprintData.goods}
                onChange={(e) => updateFootprint("goods", e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <div className="text-center mb-2">
              <span className="text-3xl font-bold">{calculateFootprint().toFixed(1)}</span>
              <span className="text-xl ml-1">tons CO₂e</span>
            </div>
            <div className="w-40 h-40 rounded-full border-8 border-gray-200 dark:border-gray-700 relative flex items-center justify-center">
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div
                  className="absolute inset-0 bg-linear-to-t from-green-gradient to-red-gradient rounded-full"
                ></div>
                <div
                  className="absolute top-0 left-0 right-0 bg-white dark:bg-darkcard width-100"
                  style={{
                    height: `${100 - Math.min(100, (calculateFootprint() / 15) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="relative z-10 text-center">
                <p className="text-md font-light drop-shadow-[2.4px_2.4px_2.4px_rgba(0,0,0,0.8)]">Your Impact</p>
                {calculateFootprint() > 10 ? (
                  <p className="text-sm font-bold drop-shadow-[2.4px_2.4px_2.4px_rgba(0,0,0,1)] text-red-400">High</p>
                ) : calculateFootprint() > 5 ? (
                  <p className="text-sm font-bold drop-shadow-[2.4px_2.4px_2.4px_rgba(0,0,0,0.8)] text-yellow-600">Medium</p>
                ) : (
                  <p className="text-sm font-bold drop-shadow-[2.4px_2.4px_2.4px_rgba(0,0,0,0.8)] text-green-600">Low</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Global average: 4.8 tons</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-darkcard rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Personal Recommendations</h2>
        <div className="space-y-3">
          {generateRecommendations(calculateFootprint()).map((rec, i) => (
            <div key={i} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start">
              <span className="mr-3 text-green-500 text-xl">✓</span>
              <p>{rec}</p>
            </div>
          ))}
        </div>
        <button
          className="mt-6 bg-primary text-white rounded-lg px-4 py-2 w-full font-medium hover:bg-opacity-90 transition"
          onClick={async () => {
              try {
                  const userRef = doc(db, 'users', currentUser.uid);
                  await updateDoc(userRef, {
                      points: (currentUser?.points || 0) + 50,
                      actions: (currentUser?.actions || 0) + 1,
                      transport: footprintData.transport,
                      food: footprintData.food,
                      energy: footprintData.energy,
                      goods: footprintData.goods
                  });
                  setModalContent("🎉 Commitment registered! +50 points");
                  setShowModal(true);
                  setTimeout(() => setShowModal(false), 2000);
              } catch (error) {
                  console.error('Error updating user data:', error);
                  setModalContent("⚠️ Error updating user data.");
                  setShowModal(true);
                  setTimeout(() => setShowModal(false), 2000);
              }
          }}
        >
          Commit to These Actions
        </button>
      </div>
    </div>
  );
}

export default Calculator;

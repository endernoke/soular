import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Calculator() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    transport: 3,
    food: 2.5,
    energy: 1.7,
    goods: 1
  });
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const total = Object.values(formData).reduce((sum, value) => sum + value, 0);
    setTotalFootprint(total);
    generateRecommendations(total);
  }, [formData]);

  const generateRecommendations = (footprint) => {
    if (footprint > 10) {
      setRecommendations([
        "Consider using public transportation more frequently",
        "Reduce meat consumption to 2-3 times per week",
        "Switch to energy-efficient appliances",
        "Improve home insulation to reduce heating/cooling needs"
      ]);
    } else if (footprint > 5) {
      setRecommendations([
        "Try carpooling or biking for shorter commutes",
        "Consider a partially plant-based diet",
        "Install smart thermostats or timers",
        "Reduce air travel when possible"
      ]);
    } else {
      setRecommendations([
        "Great job! Consider volunteering for local environmental initiatives",
        "Look into community solar projects",
        "Share your sustainable practices with friends and family",
        "Explore zero-waste shopping options"
      ]);
    }
  };

  const handleChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        footprint: totalFootprint,
        lastCalculated: new Date().toISOString()
      });
      // Award points for calculating footprint
      await updateDoc(userRef, {
        points: (currentUser.points || 0) + 10,
        actions: (currentUser.actions || 0) + 1
      });
    } catch (error) {
      console.error('Error saving footprint:', error);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-darkcard p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Carbon Footprint Calculator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transportation */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Transportation</label>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={formData.transport}
              onChange={(e) => handleChange('transport', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formData.transport} tons CO2/year</span>
              <span>15 tons CO2/year</span>
            </div>
          </div>

          {/* Food */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Food & Diet</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={formData.food}
              onChange={(e) => handleChange('food', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formData.food} tons CO2/year</span>
              <span>10 tons CO2/year</span>
            </div>
          </div>

          {/* Energy Usage */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Home Energy Usage</label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.1"
              value={formData.energy}
              onChange={(e) => handleChange('energy', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formData.energy} tons CO2/year</span>
              <span>8 tons CO2/year</span>
            </div>
          </div>

          {/* Goods & Services */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Goods & Services</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={formData.goods}
              onChange={(e) => handleChange('goods', e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{formData.goods} tons CO2/year</span>
              <span>5 tons CO2/year</span>
            </div>
          </div>

          {/* Total Footprint */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Your Total Carbon Footprint</h2>
            <div className="text-4xl font-bold text-primary mb-2">
              {totalFootprint.toFixed(1)} <span className="text-xl">tons CO2/year</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full carbon-gauge"
                style={{ width: `${Math.min((totalFootprint / 38) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Global average: 4.7 tons CO2/year
            </p>
          </div>

          {/* Recommendations */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 mt-8"
          >
            {saving ? 'Saving...' : 'Save Results'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Calculator;

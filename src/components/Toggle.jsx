// components/Toggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function Toggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
      <button onClick={toggleTheme}>
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
    </div>
  );
}

export default Toggle;

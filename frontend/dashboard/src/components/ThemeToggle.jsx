import React from 'react';
import { useEffect } from 'react';

import { useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = ({ isCollapsed = false }) => {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light'
    );

useEffect(() => {
    if(theme === 'dark' ) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}, [theme]);
const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');

};
    return (
        <button onClick={handleToggle}
        className='btn btn-ghost w-full flex justify-start gap-4 normal-case text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'>
            {theme === "dark" ? <FaSun size={20} className="text-yellow-400"/> : <FaMoon size={20} />}
            <span className={`font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
    );
};

export default ThemeToggle;
// File: src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, Clock } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/coming-soon', label: 'Coming Soon', icon: <Clock size={18} /> },
];

export default function Sidebar({ dark, setDark, open }) {
  const location = useLocation();

  return (
    <div className={`${open ? 'w-64' : 'w-16'} transition-all duration-300 h-full bg-white dark:bg-gray-900 shadow p-4 space-y-4 flex flex-col`}>
      <div className="flex items-center gap-2 mb-4">
       
      </div>
      <ul className="space-y-2 flex-1">
        {links.map((link, i) => (
          <li key={i}>
            <Link
              to={link.to}
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${location.pathname === link.to ? 'bg-gray-200 dark:bg-gray-700 font-semibold' : ''}`}
            >
              {link.icon}
              {open && link.label}
            </Link>
          </li>
        ))}
      </ul>
      <button
        onClick={() => setDark(!dark)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
        {open && (dark ? 'Light mode' : 'Dark mode')}
      </button>
    </div>
  );
}

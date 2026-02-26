import React , {useContext,useMemo, useState} from 'react';
import { Bell, Menu } from 'lucide-react';
import { AuthContext } from '../auth/AuthProvider';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AppBar({ toggleSidebar }) {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const initial = useMemo(() => {
    if (!userInfo?.ten_nd) return '';
    const parts = userInfo.ten_nd.trim().split(' ');
    return parts[parts.length - 1][0]?.toUpperCase() || '';
  }, [userInfo]);

  const randomBgColor = useMemo(() => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-blue-800 shadow-md flex-shrink-0 w-full">
      <button onClick={toggleSidebar} className="text-gray-700 dark:text-gray-200">
        <Menu size={24} color='red' />
      </button>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-700 dark:text-gray-200" />

        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className={`w-8 h-8 ${randomBgColor} text-white rounded-full flex items-center justify-center font-bold`}>
            {initial}
          </HeadlessMenu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <HeadlessMenu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
              <div className="py-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => navigate('/profile')}
                      className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100' : ''}`}
                    >
                      Trang cá nhân
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => logout?.()}
                      className={`w-full text-left px-4 py-2 text-sm text-red-500 ${active ? 'bg-gray-100' : ''}`}
                    >
                      Đăng xuất
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
            </HeadlessMenu.Items>
          </Transition>
        </HeadlessMenu>
      </div>
    </div>
  );
}

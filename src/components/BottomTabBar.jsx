import React from 'react';
import { Home, Plus, Search, User,ClipboardList ,Flower , ChartNoAxesCombined , Ellipsis} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Trang chủ', icon: Home, path: '/' },
    { label: 'ĐHSXKD', icon: Flower, path: '/taichiem-mangkhac' },  
    { label: '      ', icon: Ellipsis , path: '' },
    { label: ' GHTT ', icon: ChartNoAxesCombined , path: '/brcd/ghtd2' },
    { label: ' Notify ', icon: ClipboardList, path: '/brcd/ghtt-push' },
  ];
 
  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-1">
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-[36px] shadow-xl flex justify-around items-center h-14">
        {navItems.slice(0, 2).map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center cursor-pointer"
            >
              <Icon size={20} color={isActive(item.path) ? 'red' : 'white'} />
              <span className="text-[12px] mt-1">{item.label}</span>
            </div>
          );
        })}

        <button
          onClick={() => navigate('/')}
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg border-4 border-white p-1 hover:scale-105 transition-transform"
        >
          <img
            src="/logo-vnpt.png"
            alt="VNPT"
            className="w-10 h-10 object-contain rounded-full"
          />
        </button>

        {navItems.slice(2).map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center cursor-pointer"
            >
              <Icon size={20} color={isActive(item.path) ? 'red' : 'white'} />
              <span className="text-[12px] mt-1">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

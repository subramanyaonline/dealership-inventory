import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User as UserIcon, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAddVehicle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenAddVehicle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="main-header sticky top-0 z-40 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="brand-mark p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Car size={22} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">DriveLine</span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-slate-900 text-white/90 tracking-[0.12em]">
              Inventory
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              {user.role === 'ADMIN' && (
                <button
                  onClick={onOpenAddVehicle}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-700 hover:bg-blue-600/15 font-semibold rounded-xl text-sm transition border border-blue-200"
                >
                  + Add Vehicle
                </button>
              )}

              <div className="user-chip flex items-center space-x-2 text-sm text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
                {user.role === 'ADMIN' ? (
                  <Shield size={16} className="text-amber-500" />
                ) : (
                  <UserIcon size={16} className="text-slate-500" />
                )}
                <span className="font-semibold truncate max-w-[150px]">{user.email}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-slate-500">
                  ({user.role})
                </span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-500 hover:text-red-600 rounded-xl hover:bg-slate-100 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="auth-button px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
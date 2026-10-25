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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Car size={24} />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">DriveLine</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
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
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg text-sm transition"
                >
                  + Add Vehicle
                </button>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                {user.role === 'ADMIN' ? (
                  <Shield size={16} className="text-amber-600" />
                ) : (
                  <UserIcon size={16} className="text-gray-500" />
                )}
                <span className="font-medium truncate max-w-[150px]">{user.email}</span>
                <span className="text-xs uppercase font-bold text-gray-500">
                  ({user.role})
                </span>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
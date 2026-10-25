import React, { useState } from 'react';
import type { Vehicle } from '../types';
import { useAuth } from '../context/AuthContext';
import { Trash2, PlusCircle, ShoppingCart } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: number) => Promise<void>;
  onRestock: (id: number, amount: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRequireAuth: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  onRestock,
  onDelete,
  onRequireAuth,
}) => {
  const { user } = useAuth();
  const [restockAmount, setRestockAmount] = useState<number>(5);
  const [showRestockInput, setShowRestockInput] = useState(false);
  const [busy, setBusy] = useState(false);

  const isOutOfStock = vehicle.quantity <= 0;

  const handlePurchase = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setBusy(true);
    try {
      await onPurchase(vehicle.id);
    } finally {
      setBusy(false);
    }
  };

  const handleRestock = async () => {
    if (restockAmount <= 0) return;
    setBusy(true);
    try {
      await onRestock(vehicle.id, restockAmount);
      setShowRestockInput(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {vehicle.category}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isOutOfStock
                ? 'bg-red-100 text-red-700'
                : vehicle.quantity < 3
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
          </span>
        </div>

        <p className="text-2xl font-extrabold text-gray-900 mt-3">
          ${vehicle.price.toLocaleString()}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
        <button
          onClick={handlePurchase}
          disabled={isOutOfStock || busy}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
        >
          <ShoppingCart size={16} />
          {isOutOfStock ? 'Sold Out' : 'Purchase'}
        </button>

        {user?.role === 'ADMIN' && (
          <div className="pt-2 border-t border-dashed border-gray-200 flex flex-col gap-2">
            {showRestockInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  onClick={handleRestock}
                  disabled={busy}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowRestockInput(false)}
                  className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setShowRestockInput(true)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <PlusCircle size={14} />
                  Restock
                </button>
                <button
                  onClick={() => onDelete(vehicle.id)}
                  disabled={busy}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
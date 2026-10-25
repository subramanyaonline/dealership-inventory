import { useState, useEffect, useCallback } from 'react';
import type { Vehicle, CreateVehicleInput } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { VehicleCard } from './components/VehicleCard';
import { VehicleModal } from './components/VehicleModal';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      if (searchQuery.trim() !== '' || selectedCategory !== '') {
        const data = await api.searchVehicles(searchQuery, selectedCategory);
        setVehicles(data);
      } else {
        const data = await api.getVehicles();
        setVehicles(data);
      }
    } catch {
      showToast('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  const handlePurchase = async (id: number) => {
    try {
      const res = await api.purchaseVehicle(id);
      showToast(res.message);
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: res.remainingQuantity } : v))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message);
      }
    }
  };

  const handleRestock = async (id: number, amount: number) => {
    try {
      const res = await api.restockVehicle(id, amount);
      showToast(res.message);
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, quantity: res.newQuantity } : v))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await api.deleteVehicle(id);
      showToast('Vehicle deleted');
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message);
      }
    }
  };

  const handleAddVehicle = async (data: CreateVehicleInput) => {
    await api.createVehicle(data);
    showToast('Vehicle created successfully');
    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddVehicle={() => setIsAddOpen(true)}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg border border-gray-700 animate-fade-in">
          {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Vehicle Inventory
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Explore available stock, review specifications, and place instant purchases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search make or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative w-full sm:w-44">
              <SlidersHorizontal className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Coupe">Coupe</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400 font-medium">
            Loading dealership inventory...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-24 bg-white border border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 text-sm">No vehicles match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onRestock={handleRestock}
                onDelete={handleDelete}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            ))}
          </div>
        )}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <VehicleModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddVehicle}
      />
    </div>
  );
}
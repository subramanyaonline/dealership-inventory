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
    <div className="dealership-shell min-h-screen flex flex-col text-gray-900">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddVehicle={() => setIsAddOpen(true)}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
          {toastMessage}
        </div>
      )}

      <main className="dealership-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <section className="inventory-hero mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="max-w-xl">
              <span className="hero-kicker">Curated inventory</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Vehicle Inventory
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Explore available stock, compare pricing, and secure your next drive in seconds.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="filter-box relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search make or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="inventory-search-field w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="filter-box relative w-full sm:w-52">
                <SlidersHorizontal className="absolute left-3 top-3 text-slate-400" size={18} />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="inventory-select-field w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
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
        </section>

        {loading ? (
          <div className="text-center py-24 text-slate-400 font-medium text-base">
            Loading dealership inventory...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state text-center py-24 border border-dashed border-slate-300 rounded-2xl">
            <p className="text-slate-500 text-sm">No vehicles match your search criteria.</p>
          </div>
        ) : (
          <div className="inventory-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
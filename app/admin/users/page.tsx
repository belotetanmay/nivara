'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ShieldCheck, UserMinus, UserCheck, RefreshCw } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  kycStatus: string;
  createdAt: string;
  vendorProfile?: {
    businessName: string;
    verificationStatus: string;
  } | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'customer' | 'vendor' | 'suspended'>('all');

  const fetchUsers = async (query = '') => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.error || 'Failed to fetch users list.');
      }
    } catch (e) {
      setError('An error occurred loading user profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchUsers(searchInput);
  };

  const handleToggleSuspend = async (userId: string) => {
    setTogglingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || 'Suspension state toggled successfully.');
        await fetchUsers(searchInput);
      } else {
        setError(data.error || 'Failed to update user suspension state.');
      }
    } catch (err) {
      setError('Error while suspending user.');
    } finally {
      setTogglingId(null);
    }
  };

  const isUserSuspended = (u: User) => {
    if (u.role === 'VENDOR' && u.vendorProfile) {
      return u.vendorProfile.verificationStatus === 'SUSPENDED';
    }
    return u.kycStatus === 'REJECTED';
  };

  // Filter local listings
  const filteredUsers = users.filter((u) => {
    if (activeFilter === 'customer') return u.role === 'CUSTOMER';
    if (activeFilter === 'vendor') return u.role === 'VENDOR';
    if (activeFilter === 'suspended') return isUserSuspended(u);
    return true;
  });

  return (
    <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-[#E5E1D8] shadow-md">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">User Accounts Administration</h1>
        <p className="text-xs text-muted-foreground mt-1">Audit profiles, inspect role definitions, and toggle suspension controls.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded text-xs flex gap-2 items-center">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#FAF8F5] pb-4">
        
        {/* Filter categories tabs */}
        <div className="flex gap-2 text-[11px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-[#FCF9F6] text-muted-foreground hover:text-primary'
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setActiveFilter('customer')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeFilter === 'customer' ? 'bg-primary text-white shadow-sm' : 'bg-[#FCF9F6] text-muted-foreground hover:text-primary'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveFilter('vendor')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeFilter === 'vendor' ? 'bg-primary text-white shadow-sm' : 'bg-[#FCF9F6] text-muted-foreground hover:text-primary'
            }`}
          >
            Hosts
          </button>
          <button
            onClick={() => setActiveFilter('suspended')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeFilter === 'suspended' ? 'bg-primary text-white shadow-sm' : 'bg-[#FCF9F6] text-muted-foreground hover:text-primary'
            }`}
          >
            Suspended
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-64 text-xs">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E5E1D8] bg-white rounded focus:outline-none"
            />
          </div>
          <button type="submit" className="py-2 px-4 bg-[#FCF9F6] border border-[#E5E1D8] rounded font-semibold text-primary">
            Find
          </button>
        </form>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-center py-12 text-xs text-muted-foreground">No user accounts found matching this criteria.</p>
      ) : (
        <div className="overflow-x-auto border border-[#E5E1D8] rounded-xl shadow-sm">
          <table className="w-full text-xs text-left font-sans text-primary">
            <thead>
              <tr className="bg-[#FCF9F6] border-b border-[#E5E1D8] text-muted-foreground">
                <th className="p-3 font-semibold">User Profile</th>
                <th className="p-3 font-semibold">Contact Info</th>
                <th className="p-3 font-semibold">Role Name</th>
                <th className="p-3 font-semibold">KYC / Vetting</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F5]">
              {filteredUsers.map((u) => {
                const suspended = isUserSuspended(u);
                return (
                  <tr key={u.id} className="hover:bg-[#FCF9F6]/25 transition-colors">
                    <td className="p-3">
                      <span className="font-bold block text-primary">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground block">Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3">
                      <span className="block">{u.email}</span>
                      <span className="text-muted-foreground block">{u.phone || 'No Phone'}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'VENDOR' ? 'bg-[#FCF9F6] border border-[#E5E1D8] text-primary' : 'bg-gray-50 border border-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.role === 'VENDOR' && u.vendorProfile ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.vendorProfile.verificationStatus === 'APPROVED' ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-red-50 text-red-600'
                        }`}>
                          Host: {u.vendorProfile.verificationStatus}
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.kycStatus === 'VERIFIED' ? 'bg-secondary/15 text-secondary border border-secondary/20' : 'bg-red-50 text-red-600'
                        }`}>
                          KYC: {u.kycStatus}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleSuspend(u.id)}
                        disabled={togglingId === u.id}
                        className={`py-1.5 px-3 rounded text-[10px] font-bold border transition-colors inline-flex items-center gap-1.5 ${
                          suspended
                            ? 'border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/15'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {togglingId === u.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : suspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Reactivate
                          </>
                        ) : (
                          <>
                            <UserMinus className="w-3.5 h-3.5" /> Suspend
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

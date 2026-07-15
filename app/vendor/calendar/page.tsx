'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar as CalendarIcon, Clock, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface Van {
  id: string;
  title: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export default function VendorCalendar() {
  const [vans, setVans] = useState<Van[]>([]);
  const [selectedVanId, setSelectedVanId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  
  const [loadingVans, setLoadingVans] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const fetchVans = async () => {
    try {
      const res = await fetch('/api/vendor/vans');
      const data = await res.json();
      if (res.ok && data.success) {
        setVans(data.vans || []);
        if (data.vans.length > 0) {
          setSelectedVanId(data.vans[0].id);
        }
      }
    } catch (e) {
      setError('Error fetching vans fleet.');
    } finally {
      setLoadingVans(false);
    }
  };

  const fetchSlots = async () => {
    if (!selectedVanId || !selectedDate) return;
    setLoadingSlots(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/customer/vans/${selectedVanId}/slots?date=${selectedDate}&all=true`);
      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
      } else {
        setError(data.error || 'Failed to retrieve slots.');
      }
    } catch (e) {
      setError('Error loading calendar slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchVans();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedVanId, selectedDate]);

  const handleGenerateSlots = async () => {
    if (!selectedVanId || !selectedDate) return;
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/vendor/availability/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vanId: selectedVanId,
          date: selectedDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || 'Standard time slots generated successfully.');
        await fetchSlots();
      } else {
        setError(data.error || 'Failed to generate time slots.');
      }
    } catch (err) {
      setError('An error occurred during slot generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this open time slot?')) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/vendor/availability/${slotId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Slot removed successfully.');
        await fetchSlots();
      } else {
        setError(data.error || 'Failed to delete slot.');
      }
    } catch (err) {
      setError('Error deleting time slot.');
    }
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12 sm:px-6">
        <div className="bg-white p-6 sm:p-8 border border-[#E5E1D8] rounded-xl shadow-md space-y-6">
          
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-primary">Availability Calendar</h1>
            <p className="text-xs text-muted-foreground mt-1">Configure and manage bookable time blocks for your vehicles.</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex gap-2.5 items-start p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex gap-2.5 items-start p-3 bg-green-50 text-green-700 border border-green-200 rounded text-xs">
              <Check className="w-4.5 h-4.5 text-green-500 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Configuration Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-primary">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Select Van
              </label>
              <select
                disabled={loadingVans}
                value={selectedVanId}
                onChange={(e) => setSelectedVanId(e.target.value)}
                className="w-full p-2.5 border border-[#E5E1D8] bg-white rounded-md focus:outline-none"
              >
                {vans.length === 0 ? (
                  <option value="">No vans listed</option>
                ) : (
                  vans.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-[#E5E1D8] bg-white rounded-md focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Generator Controls */}
          {selectedVanId && (
            <div className="p-4 bg-[#FCF9F6] border border-[#E5E1D8]/65 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-primary block">Auto-Generate Time Blocks</span>
                <p className="text-[10px] text-muted-foreground leading-normal max-w-sm">
                  Quickly generate standard hour-long slots from 9:00 AM to 6:00 PM for the selected date. Already existing blocks will be skipped.
                </p>
              </div>

              <button
                onClick={handleGenerateSlots}
                disabled={isGenerating || loadingSlots}
                className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded shadow transition-all whitespace-nowrap"
              >
                {isGenerating ? 'Generating...' : 'Generate 9AM - 6PM Slots'}
              </button>
            </div>
          )}

          {/* Slots Calendar Grid */}
          <div className="pt-4 border-t border-[#FAF8F5] space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary">Generated Time Blocks</h3>

            {loadingSlots ? (
              <div className="flex justify-center py-12">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-[#E5E1D8] rounded-xl bg-[#FCF9F6]/20">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <span>No slots configured for this date. Click generate above to get started.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => {
                  const slotEnd = new Date(slot.endTime);
                  const bufferEnd = new Date(slotEnd.getTime() + 15 * 60000);

                  return (
                    <React.Fragment key={slot.id}>
                      {/* Actual Time Slot */}
                      <div
                        className={`p-3.5 rounded-lg border flex justify-between items-center text-xs transition-all ${
                          slot.isBooked
                            ? 'bg-gray-100 border-gray-200 text-gray-500 shadow-inner'
                            : 'bg-white border-[#E5E1D8] text-primary hover:border-secondary/40 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-primary block">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-medium">Bookable Session</span>
                          </div>
                        </div>

                        {slot.isBooked ? (
                          <span className="text-[9px] bg-secondary/15 text-secondary border border-secondary/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider select-none">
                            Booked
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Cleaning Buffer Block */}
                      <div className="p-3.5 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-gray-400 flex justify-between items-center text-xs shadow-inner">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-medium text-gray-500 block">
                              {formatTime(slot.endTime)} - {formatTime(bufferEnd.toISOString())}
                            </span>
                            <span className="text-[9px] text-gray-400 block font-medium">Mandatory Gap</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-gray-200/50 text-gray-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider select-none">
                          Cleaning Buffer
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

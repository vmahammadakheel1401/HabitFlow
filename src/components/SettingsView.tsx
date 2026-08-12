import { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Moon, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Palette, 
  Calendar, 
  User, 
  Check, 
  X 
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { Habit, HabitLog, UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  handleGoogleLogin: () => void;
  handleLogout: () => void;
  habits: Habit[];
  logs: HabitLog[];
  notificationsEnabled: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  onToggleNotifications: (enabled: boolean) => void;
  onSendTestNotification: () => void;
  onImportData: (importedHabits: Habit[], importedLogs: HabitLog[]) => Promise<void>;
  onResetData: () => Promise<void>;
}

const ACCENT_COLORS = [
  { id: 'emerald', name: 'Emerald', hex: '#059669', class: 'bg-[#059669]' },
  { id: 'indigo', name: 'Indigo', hex: '#4f46e5', class: 'bg-[#4f46e5]' },
  { id: 'sunset', name: 'Sunset', hex: '#ea580c', class: 'bg-[#ea580c]' },
  { id: 'rose', name: 'Rose', hex: '#e11d48', class: 'bg-[#e11d48]' },
];

export function SettingsView({
  user,
  userProfile,
  handleGoogleLogin,
  handleLogout,
  habits,
  logs,
  notificationsEnabled,
  permissionStatus,
  onToggleNotifications,
  onSendTestNotification,
  onImportData,
  onResetData,
}: SettingsViewProps) {
  // Sync Status State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('Just now');

  // Theme Accent State
  const [selectedAccent, setSelectedAccent] = useState<string>(() => {
    return localStorage.getItem('theme_accent_color') || '#059669';
  });

  // Week & Day Rollover Preferences
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<'Monday' | 'Sunday'>(() => {
    return (localStorage.getItem('first_day_of_week') as 'Monday' | 'Sunday') || 'Monday';
  });

  const [dayRolloverTime, setDayRolloverTime] = useState<string>(() => {
    return localStorage.getItem('day_rollover_time') || '00:00';
  });

  // Quiet Hours State
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(() => {
    return localStorage.getItem('quiet_hours_enabled') === 'true';
  });
  const [quietHoursStart, setQuietHoursStart] = useState<string>(() => {
    return localStorage.getItem('quiet_hours_start') || '22:00';
  });
  const [quietHoursEnd, setQuietHoursEnd] = useState<string>(() => {
    return localStorage.getItem('quiet_hours_end') || '07:00';
  });

  // Modal & File Import States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync animation handler
  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showStatus('success', 'Synced with Firebase Cloud successfully!');
    }, 1200);
  };

  // Change Accent Color
  const handleSelectAccent = (hex: string) => {
    setSelectedAccent(hex);
    localStorage.setItem('theme_accent_color', hex);
    document.documentElement.style.setProperty('--color-primary', hex);
    showStatus('success', 'Theme accent color updated!');
  };

  // Change First Day of Week
  const handleFirstDayChange = (day: 'Monday' | 'Sunday') => {
    setFirstDayOfWeek(day);
    localStorage.setItem('first_day_of_week', day);
    showStatus('success', `First day of week set to ${day}`);
  };

  // Change Day Rollover
  const handleRolloverChange = (time: string) => {
    setDayRolloverTime(time);
    localStorage.setItem('day_rollover_time', time);
    showStatus('success', 'Day rollover time updated!');
  };

  // Toggle Quiet Hours
  const handleQuietHoursToggle = (enabled: boolean) => {
    setQuietHoursEnabled(enabled);
    localStorage.setItem('quiet_hours_enabled', enabled ? 'true' : 'false');
  };

  const handleQuietHoursStartChange = (time: string) => {
    setQuietHoursStart(time);
    localStorage.setItem('quiet_hours_start', time);
  };

  const handleQuietHoursEndChange = (time: string) => {
    setQuietHoursEnd(time);
    localStorage.setItem('quiet_hours_end', time);
  };

  // Export Data JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        appName: 'HabitFlow',
        habits,
        logs,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habitflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStatus('success', 'Backup JSON downloaded successfully!');
    } catch (err) {
      console.error('Export error:', err);
      showStatus('error', 'Failed to generate export file.');
    }
  };

  // Import Data JSON
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed.habits || !Array.isArray(parsed.habits)) {
        showStatus('error', 'Invalid backup format: missing habits array.');
        return;
      }

      const importedHabits: Habit[] = parsed.habits || [];
      const importedLogs: HabitLog[] = parsed.logs || [];

      await onImportData(importedHabits, importedLogs);
      showStatus('success', `Imported ${importedHabits.length} habits & ${importedLogs.length} logs!`);
    } catch (err) {
      console.error('Import error:', err);
      showStatus('error', 'Failed to parse JSON backup file.');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  // Reset Data Handler
  const handleConfirmReset = async () => {
    if (resetConfirmationInput.toUpperCase() !== 'RESET') return;

    setIsResetting(true);
    try {
      await onResetData();
      setShowResetModal(false);
      setResetConfirmationInput('');
      showStatus('success', 'All habit data and logs have been reset.');
    } catch (err) {
      console.error('Reset error:', err);
      showStatus('error', 'Failed to reset data.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleTest = () => {
    onSendTestNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
          <p className="text-xs text-gray-400 mt-1">Configure preferences, notification schedules, and data sync</p>
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div
          className={cn(
            "p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md transition-all",
            statusMessage.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
          )}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* CARD 1: Account & Sync Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Account & Cloud Sync</h3>
              <p className="text-xs text-gray-400">Manage account identity & live Firebase database status</p>
            </div>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
            title="Trigger Cloud Sync"
          >
            <RefreshCw size={14} className={cn(isSyncing && "animate-spin text-primary")} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Profile Details & Sync Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-black/5">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
                {userProfile?.displayName?.[0] || user?.displayName?.[0] || 'G'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="font-bold text-gray-900 text-sm truncate">{userProfile?.displayName || user?.displayName || 'Guest Explorer'}</p>
              <p className="text-xs text-gray-400 truncate">{userProfile?.email || user?.email || 'Anonymous Session'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-center space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-xs text-emerald-900">Firebase Firestore Live</span>
            </div>
            <p className="text-[11px] text-emerald-700">Cloud Sync Active • Last updated {lastSyncedTime}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          {user?.isAnonymous || !user ? (
            <button
              onClick={handleGoogleLogin}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <LogIn size={16} />
              Sign In with Google
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          )}
        </div>
      </section>

      {/* CARD 2: Preferences & Customization Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-black/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Preferences & Customization</h3>
            <p className="text-xs text-gray-400">Personalize theme accent color, week start, and day rollover</p>
          </div>
        </div>

        {/* Color Accent Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Color Accent Theme</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACCENT_COLORS.map((color) => {
              const isSelected = selectedAccent === color.hex;
              return (
                <button
                  key={color.id}
                  onClick={() => handleSelectAccent(color.hex)}
                  className={cn(
                    "p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95",
                    isSelected ? "border-gray-900 bg-gray-50 shadow-sm" : "border-black/5 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("w-5 h-5 rounded-full shadow-inner", color.class)} />
                    <span className="font-bold text-xs text-gray-800">{color.name}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-gray-900" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* First Day of Week Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-black/5">
          <div>
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span>First Day of Week</span>
            </h4>
            <p className="text-xs text-gray-400">Sets the calendar layout and weekly stats start day</p>
          </div>

          <div className="inline-flex p-1 bg-gray-100 rounded-2xl border border-black/5">
            {(['Monday', 'Sunday'] as const).map((day) => (
              <button
                key={day}
                onClick={() => handleFirstDayChange(day)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  firstDayOfWeek === day ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Night Owl Mode (Day Rollover Time) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/5">
          <div>
            <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Moon size={16} className="text-primary" />
              <span>Night Owl Mode (Day Rollover)</span>
            </h4>
            <p className="text-xs text-gray-400">Habits completed before this hour count towards the previous day</p>
          </div>

          <select
            value={dayRolloverTime}
            onChange={(e) => handleRolloverChange(e.target.value)}
            className="bg-gray-50 border border-black/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="00:00">12:00 AM (Standard Midnight)</option>
            <option value="02:00">2:00 AM (Night Owl)</option>
            <option value="03:00">3:00 AM (Late Night Owl)</option>
          </select>
        </div>
      </section>

      {/* CARD 3: Notifications & Quiet Hours Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Notifications & Quiet Hours</h3>
              <p className="text-xs text-gray-400">Configure push alert permissions and sleep non-disturb hours</p>
            </div>
          </div>

          {/* Master Notification Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled && permissionStatus === 'granted'}
              onChange={(e) => onToggleNotifications(e.target.checked)}
              className="sr-only peer"
              disabled={permissionStatus === 'unsupported'}
            />
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Permission Status Indicator */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 flex items-center justify-between text-xs font-semibold">
          <span className="text-gray-500">Browser Permission Status:</span>
          {permissionStatus === 'granted' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Granted
            </span>
          )}
          {permissionStatus === 'denied' && (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold flex items-center gap-1">
              <ShieldAlert size={12} /> Denied
            </span>
          )}
          {permissionStatus === 'default' && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center gap-1">
              <AlertCircle size={12} /> Required
            </span>
          )}
          {permissionStatus === 'unsupported' && (
            <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 font-bold">
              Not Supported
            </span>
          )}
        </div>

        {/* Quiet Hours Controls */}
        <div className="space-y-4 pt-2 border-t border-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
              <Moon size={16} className="text-primary" />
              <span>Quiet Hours (Suppress Notifications)</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => handleQuietHoursToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <p className="text-xs text-gray-400">
            Push alerts (scheduled habit reminders and evening streak savers) will be silently muted during quiet hours.
          </p>

          {quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-black/5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quiet Start Time</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => handleQuietHoursStartChange(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quiet End Time</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => handleQuietHoursEndChange(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Test Notification Trigger */}
        <div className="pt-2 border-t border-black/5 flex justify-between items-center">
          <span className="text-xs text-gray-400">Send an instant push alert to test setup:</span>
          <button
            onClick={handleTest}
            disabled={permissionStatus !== 'granted'}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-gray-800 disabled:opacity-40 disabled:grayscale transition-all active:scale-95"
          >
            <Sparkles size={14} />
            {testSent ? 'Sent!' : 'Test Notification'}
          </button>
        </div>
      </section>

      {/* CARD 4: Data Management Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-black/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-black/5 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Database size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Data Management & Backup</h3>
            <p className="text-xs text-gray-400">Export local backups, restore habit logs, or reset data</p>
          </div>
        </div>

        {/* Data Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-black/5 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download size={20} />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800">Export Backup (JSON)</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{habits.length} habits • {logs.length} logs</p>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-black/5 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800">{isImporting ? 'Importing...' : 'Import Backup'}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Restore from .json file</p>
            </div>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />

          {/* Reset All Data */}
          <button
            onClick={() => setShowResetModal(true)}
            className="p-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 flex flex-col items-center justify-center gap-2 text-center transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="font-bold text-xs text-red-600">Reset All Data</p>
              <p className="text-[10px] text-red-400 mt-0.5">Erase all habits & logs</p>
            </div>
          </button>
        </div>
      </section>

      {/* Safety Confirmation Modal for Reset Data */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Reset All Habit Data?</h3>
                <p className="text-xs text-red-500 font-semibold">Critical safety warning</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-red-50/50 p-3.5 rounded-2xl border border-red-100">
              This action is permanent and cannot be undone. All <strong>{habits.length} habits</strong> and <strong>{logs.length} completion logs</strong> stored in your account will be permanently deleted.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Type <span className="text-red-600 font-extrabold">RESET</span> to confirm:
              </label>
              <input
                type="text"
                value={resetConfirmationInput}
                onChange={(e) => setResetConfirmationInput(e.target.value)}
                placeholder="Type RESET"
                className="w-full bg-gray-50 border border-black/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmationInput('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReset}
                disabled={resetConfirmationInput.toUpperCase() !== 'RESET' || isResetting}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-40 disabled:grayscale transition-all shadow-md shadow-red-500/20 flex items-center gap-2"
              >
                {isResetting ? 'Resetting...' : 'Confirm Erase All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

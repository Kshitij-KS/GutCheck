'use client';

// components/gutcheck/MenuInput.tsx

import { useState, useRef, useCallback } from 'react';
import { Send, Upload, X, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFileUpload } from '@/lib/security';

interface MenuInputProps {
  onAnalyze: (menuText: string, menuSource: string) => void;
  disabled?: boolean;
}

export function MenuInput({ onAnalyze, disabled }: MenuInputProps) {
  const [menuText, setMenuText] = useState('');
  const [menuSource, setMenuSource] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (!menuText.trim() || disabled) return;
    onAnalyze(menuText.trim(), menuSource.trim() || 'Scanned menu');
  }, [menuText, menuSource, disabled, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);

    const validation = validateFileUpload(file, {
      maxSizeMB: 5,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (!validation.isSafe) {
      setPhotoError(validation.reason ?? 'Invalid file');
      return;
    }

    // Convert to base64 and set as placeholder text
    const reader = new FileReader();
    reader.onload = () => {
      setMenuText(`[Menu photo uploaded: ${file.name}]\n\nPlease paste the menu text here if OCR is not available.`);
      setMenuSource(file.name);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearText = () => {
    setMenuText('');
    setMenuSource('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Restaurant name input */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-400">
          Restaurant Name <span className="text-slate-600">(optional)</span>
        </label>
        <input
          type="text"
          value={menuSource}
          onChange={(e) => setMenuSource(e.target.value)}
          placeholder="e.g., Bukhara, ITC Maurya"
          disabled={disabled}
          className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      {/* Menu text area */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-400">
            Menu Text <span className="text-red-400">*</span>
          </label>
          {menuText && (
            <button onClick={clearText} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <textarea
          value={menuText}
          onChange={(e) => setMenuText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste the restaurant menu here — dish names, descriptions, and prices. GutCheck will extract and analyze every dish against your health profile.

Example:
• Tandoori Chicken - marinated chicken grilled in clay oven
• Dal Makhani - slow-cooked black lentils with butter and cream
• Palak Paneer - cottage cheese in spiced spinach gravy..."
          disabled={disabled}
          rows={12}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 resize-none font-mono leading-relaxed"
        />
        <p className="mt-1 text-xs text-slate-600">
          {menuText.length > 0 ? `${menuText.length} characters · ` : ''}
          Tip: Ctrl+Enter to analyze
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-slate-300 transition-all',
            'hover:border-slate-600 hover:bg-slate-700/50 hover:text-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Upload className="h-4 w-4" />
          Photo
        </button>

        <button
          onClick={handleSubmit}
          disabled={!menuText.trim() || disabled}
          id="analyze-menu-button"
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
            menuText.trim() && !disabled
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          )}
        >
          <Send className="h-4 w-4" />
          Analyze Menu
        </button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {photoError && (
        <p className="text-sm text-red-400">{photoError}</p>
      )}

      {/* Example menus hint */}
      <div className="rounded-lg bg-slate-800/30 border border-slate-700/30 p-3">
        <div className="flex items-center gap-2 mb-1">
          <ChefHat className="h-3.5 w-3.5 text-slate-500" />
          <p className="text-xs font-medium text-slate-500">Works with any cuisine</p>
        </div>
        <p className="text-xs text-slate-600">
          Indian · Chinese · Italian · Continental · Mediterranean · Japanese · Thai
        </p>
      </div>
    </div>
  );
}

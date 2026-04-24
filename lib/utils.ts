// lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MarkerStatus, DishClassification } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString));
}

export function formatTime(isoString: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export function getMarkerStatusColor(status: MarkerStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'OPTIMAL':
      return { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500' };
    case 'BORDERLINE':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'ELEVATED':
      return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' };
    case 'CRITICAL':
      return { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200', dot: 'bg-red-600' };
    case 'LOW':
      return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' };
  }
}

export function getDishClassificationColor(classification: DishClassification): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (classification) {
    case 'RECOMMENDED':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-900',
        border: 'border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    case 'CAUTION':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-900',
        border: 'border-amber-300',
        badge: 'bg-amber-100 text-amber-800',
      };
    case 'AVOID':
      return {
        bg: 'bg-red-50',
        text: 'text-red-900',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-800',
      };
  }
}

export function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

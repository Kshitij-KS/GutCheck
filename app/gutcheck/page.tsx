import { redirect } from 'next/navigation';

/** Legacy path: menu analysis lives at /scan */
export default function GutcheckAliasPage() {
  redirect('/scan');
}

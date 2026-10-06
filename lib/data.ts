'use client';
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Entry, Journey } from '@/types';

export async function ensureProfile(uid: string, profile: {displayName?: string|null; email?: string|null; photoURL?: string|null}) {
  await setDoc(doc(db, 'users', uid), {
    name: profile.displayName || '', email: profile.email || '', photoURL: profile.photoURL || '',
    plan: 'free', status: 'active', updatedAt: serverTimestamp()
  }, { merge: true });
}
export function addEntry(uid: string, entry: Entry) {
  const reference = doc(collection(db, 'users', uid, 'entries'));
  return { id: reference.id, completed: withTimeout(setDoc(reference, {...entry, createdAt: serverTimestamp()}), 'A gravação no Firestore demorou mais de 15 segundos.') };
}

function withTimeout<T>(operation: Promise<T>, message: string, timeout = 15000) {
  return Promise.race<T>([operation, new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeout))]);
}

export function firestoreErrorMessage(cause: unknown, fallback: string) {
  const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : '';
  if (code === 'permission-denied') return 'O Firestore recusou o acesso (permission-denied). Publique as regras no projeto Firebase correto.';
  if (code === 'not-found') return 'O Firestore não foi criado neste projeto Firebase (not-found).';
  if (code === 'unavailable') return 'O Firebase está indisponível (unavailable). Verifique sua conexão.';
  const detail = cause instanceof Error ? cause.message : code || 'erro desconhecido';
  return `${fallback} (${detail})`;
}

function normalizeDate(value: unknown) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  return '';
}

export async function listEntries(uid: string, start?: string, end?: string) {
  const ref = collection(db, 'users', uid, 'entries');
  const source = start && end ? query(ref, where('date', '>=', start), where('date', '<=', end)) : query(ref);
  const snap = await withTimeout(getDocs(source), 'A consulta ao Firestore demorou demais.');
  return snap.docs
    .map(d => { const data = d.data(); return { id:d.id, ...data, date:normalizeDate(data.date) } as Entry; })
    .filter(entry => (!start || entry.date >= start) && (!end || entry.date <= end))
    .sort((a, b) => b.date.localeCompare(a.date));
}
export async function removeEntry(uid: string, id: string) { return deleteDoc(doc(db, 'users', uid, 'entries', id)); }
export async function addJourney(uid: string, journey: Journey) {
  return addDoc(collection(db, 'users', uid, 'journeys'), {...journey, createdAt: serverTimestamp()});
}
export async function listJourneys(uid: string, start?: string, end?: string) {
  const ref = collection(db, 'users', uid, 'journeys');
  const source = start && end ? query(ref, where('date', '>=', start), where('date', '<=', end)) : query(ref);
  const snap = await withTimeout(getDocs(source), 'A consulta ao Firestore demorou demais.');
  return snap.docs
    .map(d => { const data = d.data(); return { id:d.id, ...data, date:normalizeDate(data.date) } as Journey; })
    .filter(journey => (!start || journey.date >= start) && (!end || journey.date <= end))
    .sort((a, b) => b.date.localeCompare(a.date));
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { listEntries, removeEntry } from '@/lib/data';
import { money } from '@/lib/format';
import type { Entry } from '@/types';

export default function Lancamentos() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  async function load() { if (!user) return; try { setLoading(true); setError(''); setEntries(await listEntries(user.uid)); } catch (cause) { const code = cause && typeof cause === 'object' && 'code' in cause ? String(cause.code) : 'erro-desconhecido'; setError(`Não foi possível carregar os lançamentos (${code}). Verifique sua conexão e as regras do Firestore.`); } finally { setLoading(false); } }
  useEffect(() => { void load(); }, [user]);
  async function del(entry: Entry) {
    if (!user || !entry.id || !confirm('Excluir este lançamento?')) return;
    const previous = entries;
    setDeletingId(entry.id); setError(''); setEntries(current => current.filter(item => item.id !== entry.id));
    try { await removeEntry(user.uid, entry.id); }
    catch { setEntries(previous); setError('Não foi possível excluir o lançamento. Confirme as regras do Firestore e tente novamente.'); }
    finally { setDeletingId(null); }
  }
  return <><h1>Lançamentos</h1><p className="muted">Histórico completo de receitas e despesas.</p>{error && <div className="error">{error}</div>}<div className="card tablewrap">{loading ? <p className="muted">Carregando lançamentos...</p> : <><table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Plataforma</th><th>Descrição</th><th>Valor</th><th></th></tr></thead><tbody>{entries.map(entry=><tr key={entry.id}><td>{entry.date ? entry.date.split('-').reverse().join('/') : 'Sem data'}</td><td><span className={`pill ${entry.type}`}>{entry.type==='income'?'Receita':'Despesa'}</span></td><td>{entry.category||'-'}</td><td>{entry.platform||'-'}</td><td>{entry.description||'-'}</td><td style={{fontWeight:800,color:entry.type==='income'?'var(--green)':'var(--red)'}}>{money(Number(entry.amount))}</td><td><button className="btn btn-light" onClick={()=>del(entry)} disabled={deletingId===entry.id}>{deletingId===entry.id?'Excluindo...':'Excluir'}</button></td></tr>)}</tbody></table>{entries.length===0&&<p className="muted">Nenhum lançamento ainda.</p>}</>}</div></>;
}

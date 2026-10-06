'use client';

import { useEffect, useMemo, useState } from 'react';
import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear, subMonths } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';
import { listEntries } from '@/lib/data';
import { exportExcel, exportPDF } from '@/lib/reports';
import { isoDate, money, sumStats } from '@/lib/format';
import type { Entry } from '@/types';

export default function Relatorios() {
  const { user } = useAuth();
  const now = new Date();
  const [start, setStart] = useState(isoDate(startOfMonth(now)));
  const [end, setEnd] = useState(isoDate(endOfMonth(now)));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  async function load(from = start, to = end) {
    if (!user) return;
    if (!from || !to || from > to) { setError('Informe um período válido.'); return; }
    setLoading(true); setError('');
    try { setEntries(await listEntries(user.uid, from, to)); }
    catch { setError('Não foi possível carregar este período. Verifique sua conexão e as regras do Firestore.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [user]);

  function range(kind: 'week'|'month'|'3m'|'4m'|'year') {
    let from: Date, to: Date;
    if (kind === 'week') { from = startOfWeek(now, {weekStartsOn:1}); to = endOfWeek(now, {weekStartsOn:1}); }
    else if (kind === 'month') { from = startOfMonth(now); to = endOfMonth(now); }
    else if (kind === '3m') { from = startOfMonth(subMonths(now, 2)); to = endOfMonth(now); }
    else if (kind === '4m') { from = startOfMonth(subMonths(now, 3)); to = endOfMonth(now); }
    else { from = startOfYear(now); to = endOfYear(now); }
    const startValue = isoDate(from), endValue = isoDate(to);
    setStart(startValue); setEnd(endValue); void load(startValue, endValue);
  }

  async function exportReport(kind: 'excel'|'pdf') {
    setExporting(true); setError('');
    try { if (kind === 'excel') await exportExcel(entries, start, end); else await exportPDF(entries, start, end); }
    catch { setError('Não foi possível gerar o arquivo. Tente novamente.'); }
    finally { setExporting(false); }
  }
  const stats = useMemo(() => sumStats(entries), [entries]);
  const categories = useMemo(() => {
    const values = new Map<string, number>();
    entries.filter(entry => entry.type === 'expense').forEach(entry => values.set(entry.category, (values.get(entry.category) || 0) + Number(entry.amount)));
    return [...values.entries()].sort((a,b) => b[1] - a[1]);
  }, [entries]);

  return <><h1>Relatórios</h1><p className="muted">Escolha um período e exporte seus dados.</p>{error && <div className="error">{error}</div>}<div className="card"><div className="tabs"><button className="tab" disabled={loading} onClick={()=>range('week')}>Esta semana</button><button className="tab" disabled={loading} onClick={()=>range('month')}>Este mês</button><button className="tab" disabled={loading} onClick={()=>range('3m')}>Últimos 3 meses</button><button className="tab" disabled={loading} onClick={()=>range('4m')}>Últimos 4 meses</button><button className="tab" disabled={loading} onClick={()=>range('year')}>Este ano</button></div><div className="grid grid-3" style={{marginTop:18}}><div className="field"><label>De</label><input type="date" value={start} disabled={loading} onChange={event=>setStart(event.target.value)}/></div><div className="field"><label>Até</label><input type="date" value={end} disabled={loading} onChange={event=>setEnd(event.target.value)}/></div><div style={{display:'flex',alignItems:'end',paddingBottom:14}}><button className="btn btn-dark" style={{width:'100%'}} disabled={loading} onClick={()=>void load()}>{loading?'Carregando...':'Aplicar período'}</button></div></div></div><div className="grid grid-3" style={{marginTop:16}}><div className="card metric green"><div className="label">Faturamento</div><div className="value">{money(stats.income)}</div></div><div className="card metric red"><div className="label">Gastos</div><div className="value">{money(stats.expense)}</div></div><div className="card metric blue"><div className="label">Lucro</div><div className="value">{money(stats.profit)}</div></div></div><div className="grid grid-2" style={{marginTop:16}}><div className="card"><h3>Principais gastos</h3>{categories.length ? categories.map(([category,value])=><div key={category} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}><span>{category}</span><b>{money(value)}</b></div>) : <p className="muted">Sem gastos no período.</p>}</div><div className="card"><h3>Exportar relatório</h3><p className="muted">{entries.length} lançamentos encontrados.</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn btn-green" disabled={loading||exporting} onClick={()=>void exportReport('excel')}>{exporting?'Gerando...':'Exportar Excel'}</button><button className="btn btn-red" disabled={loading||exporting} onClick={()=>void exportReport('pdf')}>{exporting?'Gerando...':'Gerar PDF'}</button></div></div></div></>;
}

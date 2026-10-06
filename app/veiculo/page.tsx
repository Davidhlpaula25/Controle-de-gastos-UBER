'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { addJourney, listJourneys } from '@/lib/data';
import { isoDate } from '@/lib/format';
import type { Journey } from '@/types';

export default function Veiculo() {
  const { user } = useAuth();
  const [date, setDate] = useState(isoDate(new Date()));
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [startedAt, setStartedAt] = useState('08:00');
  const [endedAt, setEndedAt] = useState('18:00');
  const [list, setList] = useState<Journey[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() { if (!user) return; try { setList(await listJourneys(user.uid)); } catch { setError('Não foi possível carregar as jornadas.'); } }
  useEffect(() => { void load(); }, [user]);
  async function save() { const start = Number(kmStart), end = Number(kmEnd); if (!user) return; if (!date || !Number.isFinite(start) || !Number.isFinite(end) || end < start || endedAt <= startedAt) { setError('Informe uma data, quilômetros válidos e um horário final posterior ao inicial.'); return; } setSaving(true); setError(''); try { await addJourney(user.uid, { date, kmStart:start, kmEnd:end, startedAt, endedAt }); setKmStart(''); setKmEnd(''); await load(); } catch { setError('Não foi possível salvar a jornada. Verifique as regras do Firestore.'); } finally { setSaving(false); } }

  return <><h1>Veículo e jornada</h1><p className="muted">Registre quilômetros e horas para saber o lucro real por km e por hora.</p>{error && <div className="error">{error}</div>}<div className="card"><h3>Registrar jornada</h3><div className="grid grid-3"><div className="field"><label>Data</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div><div className="field"><label>KM inicial</label><input type="number" min="0" value={kmStart} onChange={e=>setKmStart(e.target.value)}/></div><div className="field"><label>KM final</label><input type="number" min="0" value={kmEnd} onChange={e=>setKmEnd(e.target.value)}/></div><div className="field"><label>Início</label><input type="time" value={startedAt} onChange={e=>setStartedAt(e.target.value)}/></div><div className="field"><label>Final</label><input type="time" value={endedAt} onChange={e=>setEndedAt(e.target.value)}/></div></div><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar jornada'}</button></div><div className="card tablewrap" style={{marginTop:16}}><table className="table"><thead><tr><th>Data</th><th>KM inicial</th><th>KM final</th><th>KM rodados</th><th>Início</th><th>Final</th></tr></thead><tbody>{list.map(j=><tr key={j.id}><td>{j.date.split('-').reverse().join('/')}</td><td>{j.kmStart}</td><td>{j.kmEnd}</td><td><b>{j.kmEnd-j.kmStart} km</b></td><td>{j.startedAt}</td><td>{j.endedAt}</td></tr>)}</tbody></table>{list.length===0&&<p className="muted">Nenhuma jornada registrada.</p>}</div></>;
}

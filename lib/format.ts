export const money = (value:number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value||0);
export const isoDate = (d:Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export function parseMoney(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}
export function sumStats(entries: Array<{type:string; amount:number}>) {
  const income = entries.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount||0),0);
  const expense = entries.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount||0),0);
  return {income, expense, profit: income-expense};
}

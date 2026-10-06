'use client';

import type { Entry } from '@/types';
import { money, sumStats } from './format';

export async function exportExcel(entries:Entry[], start:string, end:string) {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([import('exceljs'), import('file-saver')]);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Relatorio');
  ws.columns = [{header:'Data',key:'date',width:14},{header:'Tipo',key:'type',width:12},{header:'Categoria',key:'category',width:20},{header:'Plataforma',key:'platform',width:16},{header:'Descricao',key:'description',width:32},{header:'Valor',key:'amount',width:16}];
  entries.forEach(e=>ws.addRow({...e,type:e.type==='income'?'Receita':'Despesa',amount:Number(e.amount)}));
  ws.getRow(1).font={bold:true}; ws.getColumn('amount').numFmt='R$ #,##0.00';
  const stats=sumStats(entries); ws.addRow({}); ws.addRow({description:'Faturamento',amount:stats.income}); ws.addRow({description:'Gastos',amount:stats.expense}); ws.addRow({description:'Lucro',amount:stats.profit});
  const buffer=await wb.xlsx.writeBuffer(); saveAs(new Blob([buffer]),`relatorio-${start}-a-${end}.xlsx`);
}

export async function exportPDF(entries:Entry[], start:string, end:string) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc=new jsPDF(); const stats=sumStats(entries);
  doc.setFontSize(18); doc.text('CONTROLE DRIVER',14,18); doc.setFontSize(11); doc.text(`Relatorio financeiro - ${start} a ${end}`,14,26);
  doc.text(`Faturamento: ${money(stats.income)}`,14,38); doc.text(`Gastos: ${money(stats.expense)}`,14,45); doc.text(`Lucro: ${money(stats.profit)}`,14,52);
  autoTable(doc,{startY:60,head:[['Data','Tipo','Categoria','Plataforma','Descricao','Valor']],body:entries.map(e=>[e.date,e.type==='income'?'Receita':'Despesa',e.category,e.platform||'-',e.description||'-',money(e.amount)])});
  doc.save(`relatorio-${start}-a-${end}.pdf`);
}

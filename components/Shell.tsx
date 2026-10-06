'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Car, Home, List, Plus, BarChart3, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
export default function Shell({children}:{children:React.ReactNode}){
 const p=usePathname(), r=useRouter(), {user}=useAuth();
 useEffect(()=>{if(!user&&p!=='/login') r.replace('/login')},[p,r,user]);
 if(p==='/login') return <>{children}</>;
 if(!user) return <div style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>Redirecionando...</div>;
 const nav=[['/dashboard','Início',Home],['/lancamentos','Lançamentos',List],['/dashboard?novo=1','',Plus],['/relatorios','Relatórios',BarChart3],['/veiculo','Veículo',Car]] as const;
 return <div className="app-shell"><header className="topbar"><div className="brand"><Car size={22}/> Controle Driver</div><div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13}}>{user?.displayName||user?.email}</span><button className="btn btn-light" onClick={()=>signOut(auth).then(()=>r.push('/login'))}><LogOut size={16}/></button></div></header><main className="content">{children}</main><nav className="bottomnav"><div className="bottomnav-inner">{nav.map(([href,label,Icon],i)=><Link className={`navitem ${p===href.split('?')[0]?'active':''}`} href={href} key={href}>{i===2?<span className="fab"><Icon size={26}/></span>:<Icon size={20}/>}<span>{label}</span></Link>)}</div></nav></div>
}

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Ctx = createContext<{user:User|null;loading:boolean}>({user:null,loading:true});

export function AuthProvider({children}:{children:React.ReactNode}) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => { setLoading(false); setConnectionError(true); }, 12000);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      window.clearTimeout(timer); setUser(currentUser); setLoading(false);
    }, () => { window.clearTimeout(timer); setUser(null); setLoading(false); setConnectionError(true); });
    return () => { window.clearTimeout(timer); unsubscribe(); };
  }, []);

  if (loading) return <div style={{display:'grid',placeItems:'center',minHeight:'100vh'}}>Conectando...</div>;
  if (connectionError) return <div style={{display:'grid',placeItems:'center',minHeight:'100vh',padding:24,textAlign:'center'}}><div><h2>Não foi possível conectar ao Firebase.</h2><p className="muted">Verifique sua internet e a configuração do projeto Firebase.</p><button className="btn btn-primary" onClick={()=>window.location.reload()}>Tentar novamente</button></div></div>;
  return <Ctx.Provider value={{user,loading}}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

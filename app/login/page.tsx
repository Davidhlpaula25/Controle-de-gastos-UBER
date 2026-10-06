'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { ensureProfile } from '@/lib/data';
export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState<'login'|'register'>('login'),[error,setError]=useState(''),[submitting,setSubmitting]=useState(false); const r=useRouter();
 function authMessage(code?:string){
  const messages:Record<string,string>={
   'auth/operation-not-allowed':'O login por e-mail e senha está desativado no Firebase. Ative-o em Authentication > Sign-in method.',
   'auth/email-already-in-use':'Este e-mail já possui uma conta. Escolha “Já tenho conta” para entrar.',
   'auth/invalid-email':'Informe um endereço de e-mail válido.',
   'auth/weak-password':'A senha precisa ter pelo menos 6 caracteres.',
   'auth/invalid-credential':'E-mail ou senha incorretos.',
   'auth/user-not-found':'Não existe uma conta com este e-mail.',
   'auth/wrong-password':'E-mail ou senha incorretos.',
   'auth/too-many-requests':'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
   'auth/unauthorized-domain':'Este domínio não está autorizado no Firebase. Adicione o domínio da Vercel em Authentication > Settings > Authorized domains.',
   'auth/popup-blocked':'O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente.',
   'auth/popup-closed-by-user':'A janela de login do Google foi fechada antes da conclusão.'
  };
  return messages[code||'']||'Não foi possível concluir o login. Verifique a configuração do Firebase.';
 }
 function finishLogin(user:{uid:string;displayName?:string|null;email?:string|null;photoURL?:string|null}){
  void ensureProfile(user.uid,user).catch(()=>undefined);
  r.replace('/dashboard');
 }
 async function google(){setError('');setSubmitting(true);try{const c=await signInWithPopup(auth,googleProvider);finishLogin(c.user)}catch(e:any){setError(authMessage(e?.code))}finally{setSubmitting(false)}}
 async function submit(){setError('');setSubmitting(true);try{const c=mode==='login'?await signInWithEmailAndPassword(auth,email,password):await createUserWithEmailAndPassword(auth,email,password);finishLogin(c.user)}catch(e:any){setError(authMessage(e?.code))}finally{setSubmitting(false)}}
 return <div className="login"><section className="login-hero"><div style={{maxWidth:620}}><div className="logo-mark">CD</div><h1 style={{fontSize:48,lineHeight:1.05,margin:'0 0 14px'}}>Seus ganhos, gastos e lucro sob controle.</h1><p style={{fontSize:19,color:'#c8d7e5'}}>Acompanhe Uber, 99, combustível, alimentação, quilômetros, horas e relatórios em um só lugar.</p><div className="hero-kpis"><div className="hero-kpi"><b>Semanal</b><div>Fechamento automático</div></div><div className="hero-kpi"><b>Mensal</b><div>Lucro real do período</div></div><div className="hero-kpi"><b>Relatórios</b><div>Excel e PDF</div></div></div></div></section><section className="login-panel"><div className="login-box"><h2 className="login-title">Controle Driver</h2><p className="muted">Entre para acessar seu painel.</p>{error&&<div className="error">{error}</div>}<button className="btn btn-light" style={{width:'100%',padding:14}} onClick={google} disabled={submitting}>{submitting?'Aguarde...':'G  Entrar com Google'}</button><div className="divider">ou</div><div className="field"><label>E-mail</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="voce@email.com" disabled={submitting}/></div><div className="field"><label>Senha</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Sua senha" disabled={submitting}/></div><button className="btn btn-primary" style={{width:'100%'}} onClick={submit} disabled={submitting}>{submitting?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</button><button className="btn btn-light" style={{width:'100%',marginTop:10}} onClick={()=>setMode(mode==='login'?'register':'login')} disabled={submitting}>{mode==='login'?'Ainda não tenho conta':'Já tenho conta'}</button></div></section></div>
}

import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Shell from '@/components/Shell';
export const metadata={title:'Controle Driver',description:'Controle financeiro para motoristas'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AuthProvider><Shell>{children}</Shell></AuthProvider></body></html>}

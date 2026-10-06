# Controle Driver

Aplicativo financeiro multiusuário para motoristas de aplicativo.

## Recursos
- Login com Google ou e-mail/senha usando Firebase Authentication
- Dados isolados por UID no Cloud Firestore
- Receitas e despesas por categoria/plataforma
- Dashboard com faturamento, gastos, lucro, km e horas
- Jornada diária
- Relatórios semanal, mensal, 3 meses, 4 meses, anual e personalizado
- Exportação para Excel (.xlsx) e PDF
- Layout responsivo para celular e desktop

## Rodar localmente
1. Instale Node.js LTS.
2. Rode `npm install`.
3. Copie `.env.example` para `.env.local` e preencha com os dados do Firebase.
4. Rode `npm run dev`.
5. Abra http://localhost:3000.

## Firebase
Veja `manual/Manual_Firebase_Controle_Driver.pdf`.
As regras sugeridas estão em `firebase/firestore.rules`.

## Deploy Vercel
Importe o repositório/projeto na Vercel e cadastre as mesmas variáveis de ambiente do `.env.local`.

import './core/env';
import { criarApp } from './app';
import { variavelObrigatoria } from './core/env';
import { eventos } from './core/eventos';

variavelObrigatoria('DATABASE_URL');
variavelObrigatoria('JWT_SEGREDO');

const porta = Number(process.env.PORTA ?? 3333);
const { app, modulos } = await criarApp();

app.listen(porta, () => {
  console.log(`Vitalis API em http://localhost:${porta}`);
  console.log(`Módulos carregados: ${modulos.map((m) => m.nome).join(', ') || 'nenhum'}`);
  const ouvintes = eventos.listar();
  if (Object.keys(ouvintes).length) console.log('Ouvintes de eventos:', ouvintes);
});

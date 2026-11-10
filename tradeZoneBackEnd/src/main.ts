import { Boot } from './boot/boot';

async function main() {
  const boot = new Boot();
  await boot.start();
}

main().catch((err) => {
  console.error('❌ Erro crítico ao inicializar o servidor:', err);
  process.exit(1);
});

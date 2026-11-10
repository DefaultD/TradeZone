import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { Database } from './database';

export class Boot {
  private readonly logger = new Logger('Boot');
  private readonly BASE_PORT = parseInt(process.env.PORT || '3000', 10);
  private readonly MAX_TRIES = 10;

  /**
   * Inicializa o servidor NestJS com fallback de portas.
   */
  async start() {
    let port = this.BASE_PORT;
    for (let i = 0; i < this.MAX_TRIES; i++) {
      try {
        const app = await NestFactory.create(AppModule);
        // Configurações iniciais
        this.configureCors(app);
        
        await this.setupPrismaShutdownHook(app);
        
        await app.init();
        // Aplica migrations automáticas antes de subir o servidor
        const db = app.get(Database);
        await db.applyMigrationsSystem()
        await db.applyMigrations();

        // Sobe servidor
        await app.listen(port);
        this.logger.log(`🚀 Server running on http://localhost:${port}`);
        return;
      } catch (err: any) {
        if (err.code === 'EADDRINUSE') {
          this.logger.warn(`⚠️ Porta ${port} ocupada. Tentando próxima...`);
          port++;
        } else {
          this.logger.error(`❌ Erro ao iniciar servidor: ${err.message}`);
          process.exit(1);
        }
      }
    }

    this.logger.error(
      `❌ Nenhuma porta disponível entre ${this.BASE_PORT} e ${this.BASE_PORT + this.MAX_TRIES - 1
      }`,
    );
    process.exit(1);
  }

  /**
   * Configura CORS dinamicamente conforme ambiente.
   */
  private configureCors(app: any) {
    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://tradezone.com']
          : ['http://localhost:3001'],
      credentials: true,
    });

  }

  /**
   * Fecha conexões do Prisma corretamente ao desligar.
   */
  private async setupPrismaShutdownHook(app: any) {
    const prismaService = app.get(PrismaService);
    process.on('beforeExit', async () => {
      await prismaService.$disconnect();
      await app.close();
    });
  }
}

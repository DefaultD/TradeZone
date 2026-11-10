import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

@Injectable()
export class Database implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Database.name);
  private readonly migrationsDir = path.join(process.cwd(), 'migrations', 'common');
  private readonly migrationsSystemDir = path.join(process.cwd(), 'migrations', 'system');
  private client: Client;

  // 🚀 Inicia conexão uma única vez quando o módulo é carregado
  async onModuleInit(): Promise<void> {
    this.client = new Client({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5555', 10),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'tradezone',
    });

    await this.client.connect();
    this.logger.log('✅ Conexão com o banco estabelecida com sucesso!');
  }

  // 🧹 Fecha a conexão ao encerrar o app
  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.logger.log('🛑 Conexão com o banco encerrada.');
    }
  }

  // 🔁 Disponibiliza o client para repositórios
  getClient(): Client {
    if (!this.client) {
      throw new Error('❌ Banco ainda não conectado. Verifique o ciclo de vida da aplicação.');
    }
    return this.client;
  }

  /**
   * Função genérica para aplicar migrations de um diretório e tabela específicos.
   */
 private async applyMigrationsFromDir(
  dir: string,
  table: string,
  contextLabel: string,
): Promise<void> {
  const client = this.getClient();
  this.logger.log(`🔍 Verificando migrations do ${contextLabel}...`);

  try {
    // 🔧 Cria schema e tabela de controle se ainda não existirem
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS system;

      CREATE TABLE IF NOT EXISTS system.${table} (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        success BOOLEAN DEFAULT TRUE,
        duration_ms INTEGER,
        notes TEXT,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const { rows: applied } = await client.query(
      `SELECT name FROM system.${table} ORDER BY executed_at ASC;`,
    );

    const appliedNames = applied.map((m: any) => m.name);

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedNames.includes(file)) {
        this.logger.log(`✅ Migration já aplicada: ${file}`);
        continue;
      }

      const fullPath = path.join(dir, file);
      const sql = fs.readFileSync(fullPath, 'utf-8');
      const start = Date.now();

      this.logger.log(`🚀 Aplicando migration ${contextLabel}: ${file}`);

      try {
        await client.query('BEGIN');
        await client.query(sql);
        const duration = Date.now() - start;

        await client.query(
          `INSERT INTO system.${table} (name, success, duration_ms, notes)
           VALUES ($1, TRUE, $2, 'Migration aplicada com sucesso')`,
          [file, duration],
        );

        await client.query('COMMIT');
        this.logger.log(
          `✅ Migration ${contextLabel} aplicada: ${file} (${duration}ms)`,
        );
      } catch (err: any) {
        await client.query('ROLLBACK');
        this.logger.error(
          `❌ Erro aplicando migration ${contextLabel} ${file}: ${err.message}`,
        );

        await client.query(
          `INSERT INTO system.${table} (name, success, notes)
           VALUES ($1, FALSE, $2) ON CONFLICT (name) DO NOTHING`,
          [file, err.message],
        );

        throw err;
      }
    }
  } catch (err) {
    this.logger.error(`Erro ao aplicar migrations ${contextLabel}`, err);
    throw err;
  }

  this.logger.log(`🏁 Todas as migrations do ${contextLabel} foram aplicadas.`);
}

  /**
   * Aplica migrations do schema app.
   */
  async applyMigrations(): Promise<void> {
    await this.applyMigrationsFromDir(this.migrationsDir, 'migrations', 'app');
  }

  /**
   * Aplica migrations do schema system.
   */
  async applyMigrationsSystem(): Promise<void> {
    await this.applyMigrationsFromDir(
      this.migrationsSystemDir,
      'migrations_system',
      'system',
    );
  }
}

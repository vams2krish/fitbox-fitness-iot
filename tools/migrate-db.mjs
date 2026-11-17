import '../server/env.mjs';import fs from 'node:fs';import {pool,requireDatabase} from '../server/db.mjs';import {auth} from '../server/auth.mjs';import {getMigrations} from 'better-auth/db/migration';
requireDatabase();if(!auth)throw Error('Configure BETTER_AUTH_SECRET first');
const existing=await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");console.log('Existing public tables:',existing.rows.map(r=>r.table_name).join(', ')||'(none)');
const migration=await getMigrations(auth.options);console.log('Auth schema:',migration.toBeCreated.length,'tables to create');await migration.runMigrations();
for(const name of fs.readdirSync(new URL('../server/migrations/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort()){await pool.query(fs.readFileSync(new URL('../server/migrations/'+name,import.meta.url),'utf8'));console.log('Applied '+name);}await pool.end();

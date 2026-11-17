import fs from 'node:fs';
if(!process.env.VERCEL&&fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
export const baseURL=process.env.BETTER_AUTH_URL||process.env.APP_URL||(process.env.VERCEL?'https://fitbox-fitness-iot.vercel.app':'http://127.0.0.1:4173');

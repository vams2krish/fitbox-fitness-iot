import './env.mjs';import {baseURL} from './env.mjs';import {betterAuth} from 'better-auth';import {pool} from './db.mjs';
export const auth=pool&&process.env.BETTER_AUTH_SECRET?betterAuth({
  appName:'FitBox',baseURL,secret:process.env.BETTER_AUTH_SECRET,database:pool,
  trustedOrigins:[baseURL,'https://fitbox-fitness-iot.vercel.app',...(process.env.VERCEL?[]:['http://127.0.0.1:4173','http://localhost:4173'])],
  emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,revokeSessionsOnPasswordReset:true},
  session:{expiresIn:60*60*24*14,updateAge:60*60*24},
  rateLimit:{enabled:true,storage:'database',window:60,max:50,customRules:{'/sign-in/email':{window:60,max:8},'/sign-up/email':{window:60,max:4},'/request-password-reset':{window:60,max:3}}},
  advanced:{useSecureCookies:baseURL.startsWith('https:'),defaultCookieAttributes:{httpOnly:true,sameSite:'lax'}},
}):null;

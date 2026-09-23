import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const cookieName = "solarhub_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret-change-me-please");

export async function createSession(user) {
  const token = await new SignJWT({sub:user.id,email:user.email,role:user.role,name:user.name})
    .setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret);
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly:true, sameSite:"lax", secure:process.env.NODE_ENV==="production",
    path:"/", maxAge:60*60*24*7
  });
}
export async function clearSession() {
  const store=await cookies();
  store.set(cookieName,"",{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:0});
}
export async function getSession() {
  const store=await cookies(); const token=store.get(cookieName)?.value;
  if(!token) return null;
  try { return (await jwtVerify(token,secret)).payload; } catch { return null; }
}
export async function requireUser(){ const s=await getSession(); return s?.sub?s:null; }
export async function requireAdmin(){ const s=await getSession(); return s?.sub&&s.role==="ADMIN"?s:null; }

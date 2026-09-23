import {clearSession} from "../../../../lib/auth";
export async function POST(req){await clearSession();return Response.redirect(new URL("/",req.url),303)}

import {prisma} from "../../../lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){try{await prisma.$queryRaw`SELECT 1`;return Response.json({ok:true,service:"solarhub-bd"},{headers:{"Cache-Control":"no-store"}})}catch{ return Response.json({ok:false,service:"solarhub-bd"},{status:503,headers:{"Cache-Control":"no-store"}})}}

import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth";
import { cleanText, isSameOrigin } from "../../../../../lib/security";
const STATUSES=["NEW","CONTACTED","SCHEDULED","COMPLETED","CANCELLED"];
export async function PATCH(req,{params}) {
  if (!isSameOrigin(req)) return Response.json({ error:"Invalid request origin." },{status:403});
  const admin=await requireAdmin(); if(!admin)return Response.json({error:"Unauthorized"},{status:401});
  const {id}=await params; const {status:raw}=await req.json(); const status=cleanText(raw,30);
  if(!STATUSES.includes(status))return Response.json({error:"Invalid service status."},{status:400});
  try { const request=await prisma.serviceRequest.update({where:{id},data:{status}}); await prisma.auditLog.create({data:{actorId:admin.sub,action:"SERVICE_UPDATE",entityType:"ServiceRequest",entityId:id,meta:{status}}}); return Response.json({request}); }
  catch(error){console.error(error);return Response.json({error:"Could not update service request."},{status:500});}
}

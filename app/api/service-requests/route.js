import {prisma} from "../../../lib/prisma";
export async function POST(req){
  try{
    const {name,phone,projectType,location,preferredAt,notes}=await req.json();
    if(!name||!phone||!projectType)return Response.json({error:"Name, phone and project type are required."},{status:400});
    const request=await prisma.serviceRequest.create({data:{name:name.trim(),phone:phone.trim(),projectType,location:location?.trim()||null,preferredAt:preferredAt?new Date(preferredAt):null,notes:notes?.trim()||null}});
    return Response.json({request},{status:201});
  }catch(e){console.error(e);return Response.json({error:"Could not save service request."},{status:500})}
}

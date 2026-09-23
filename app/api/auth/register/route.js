import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {createSession} from "../../../../lib/auth";
export async function POST(req){
  try{
    const {name,email,password,phone}=await req.json();
    if(!name||!email||!password||password.length<8)return Response.json({error:"Name, email and an 8+ character password are required."},{status:400});
    const normalized=email.trim().toLowerCase();
    if(await prisma.user.findUnique({where:{email:normalized}}))return Response.json({error:"An account with this email already exists."},{status:409});
    const passwordHash=await bcrypt.hash(password,12);
    const user=await prisma.user.create({data:{name:name.trim(),email:normalized,phone:phone?.trim()||null,passwordHash}});
    await createSession(user);
    return Response.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}},{status:201});
  }catch(e){console.error(e);return Response.json({error:"Could not create account."},{status:500})}
}

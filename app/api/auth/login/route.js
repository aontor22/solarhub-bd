import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {createSession} from "../../../../lib/auth";
export async function POST(req){
  try{
    const {email,password}=await req.json();
    if(!email||!password)return Response.json({error:"Email and password are required."},{status:400});
    const user=await prisma.user.findUnique({where:{email:email.trim().toLowerCase()}});
    if(!user||!(await bcrypt.compare(password,user.passwordHash)))return Response.json({error:"Invalid email or password."},{status:401});
    await createSession(user);
    return Response.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  }catch(e){console.error(e);return Response.json({error:"Could not sign in."},{status:500})}
}

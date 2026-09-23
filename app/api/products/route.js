import {prisma} from "../../../lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
  try{
    const products=await prisma.product.findMany({where:{active:true},orderBy:[{featured:"desc"},{createdAt:"desc"}],include:{category:true}});
    return Response.json({products});
  }catch(e){console.error(e);return Response.json({error:"Could not load products.",products:[]},{status:500})}
}

import {prisma} from "../../../../lib/prisma";
import {requireAdmin} from "../../../../lib/auth";
export async function GET(){
  const admin=await requireAdmin();if(!admin)return Response.json({error:"Unauthorized"},{status:401});
  const [products,orders,users,requests]=await Promise.all([prisma.product.count(),prisma.order.count(),prisma.user.count(),prisma.serviceRequest.count()]);
  return Response.json({products,orders,users,requests});
}

import {redirect} from "next/navigation";
import {requireAdmin} from "../../lib/auth";
import {prisma} from "../../lib/prisma";
import AdminDashboard from "../../components/AdminDashboard";
export const dynamic="force-dynamic";
export default async function Admin(){const s=await requireAdmin();if(!s)redirect("/login");const[products,orders,users,requestCount,requests,categories,coupons]=await Promise.all([prisma.product.findMany({orderBy:{createdAt:"desc"},include:{category:true}}),prisma.order.findMany({orderBy:{createdAt:"desc"},take:100,include:{user:{select:{name:true,email:true}},items:true}}),prisma.user.count(),prisma.serviceRequest.count(),prisma.serviceRequest.findMany({orderBy:{createdAt:"desc"},take:100}),prisma.category.findMany({orderBy:{sortOrder:"asc"}}),prisma.coupon.findMany({orderBy:{createdAt:"desc"}})]);const initial=JSON.parse(JSON.stringify({products,orders,requests,categories,coupons,counts:{orders:await prisma.order.count(),users,requests:requestCount}}));return <AdminDashboard initial={initial}/>}

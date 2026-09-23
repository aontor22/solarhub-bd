import {prisma} from "../../../lib/prisma";
import {requireUser} from "../../../lib/auth";
function orderNo(){return "SHBD-"+Date.now().toString().slice(-8)+"-"+Math.floor(100+Math.random()*900)}
export async function POST(req){
  const session=await requireUser();
  if(!session)return Response.json({error:"Please sign in before placing an order."},{status:401});
  try{
    const body=await req.json();
    const {recipient,phone,addressLine,area,district,postcode,notes,paymentMethod,items}=body;
    if(!recipient||!phone||!addressLine||!district||!Array.isArray(items)||!items.length)return Response.json({error:"Delivery details and at least one cart item are required."},{status:400});
    const qtyMap=new Map();
    for(const item of items){const q=Math.max(0,Math.floor(Number(item.quantity)||0));if(q>0)qtyMap.set(String(item.productId),(qtyMap.get(String(item.productId))||0)+q)}
    const ids=[...qtyMap.keys()];
    if(!ids.length)return Response.json({error:"Cart is empty."},{status:400});
    const result=await prisma.$transaction(async tx=>{
      const dbProducts=await tx.product.findMany({where:{id:{in:ids},active:true}});
      if(dbProducts.length!==ids.length)throw new Error("PRODUCT_MISSING");
      let subtotal=0;const itemData=[];
      for(const p of dbProducts){const quantity=qtyMap.get(p.id);if(p.stock<quantity)throw new Error(`STOCK:${p.name}`);subtotal+=p.price*quantity;itemData.push({productId:p.id,name:p.name,sku:p.sku,unitPrice:p.price,quantity})}
      const shippingFee=subtotal>=50000?0:150,total=subtotal+shippingFee;
      const order=await tx.order.create({data:{orderNo:orderNo(),userId:String(session.sub),paymentMethod:paymentMethod||"CASH_ON_DELIVERY",paymentStatus:"UNPAID",subtotal,shippingFee,total,recipient,phone,addressLine,area:area||null,district,postcode:postcode||null,notes:notes||null,items:{create:itemData}},include:{items:true}});
      for(const p of dbProducts){const quantity=qtyMap.get(p.id);const updated=await tx.product.updateMany({where:{id:p.id,stock:{gte:quantity}},data:{stock:{decrement:quantity}}});if(updated.count!==1)throw new Error(`STOCK:${p.name}`)}
      return order;
    });
    if((paymentMethod||"CASH_ON_DELIVERY")==="ONLINE")return Response.json({order:result,payment:{status:"NOT_CONFIGURED",message:"Connect your approved payment-provider adapter before enabling online payment."}},{status:201});
    return Response.json({order:result},{status:201});
  }catch(e){
    console.error(e);
    if(String(e.message).startsWith("STOCK:"))return Response.json({error:`Not enough stock for ${String(e.message).split(":").slice(1).join(":")}.`},{status:409});
    if(e.message==="PRODUCT_MISSING")return Response.json({error:"One or more cart products are no longer available."},{status:409});
    return Response.json({error:"Could not create order."},{status:500});
  }
}
export async function GET(){
  const session=await requireUser();if(!session)return Response.json({error:"Unauthorized"},{status:401});
  const orders=await prisma.order.findMany({where:{userId:String(session.sub)},orderBy:{createdAt:"desc"},include:{items:true}});
  return Response.json({orders});
}

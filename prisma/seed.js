const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const categories = [
 ["Solar Panels","solar-panels"],["Inverters","inverters"],["Batteries","batteries"],
 ["Charge Controllers","charge-controllers"],["Solar Lights","solar-lights"],
 ["Accessories","accessories"],["Solar Kits","solar-kits"]
];

const products = [
 ["Mono Solar Panel 100W","panel-100w","PANEL-100",7800,24,"Solar Panels",["100W output","Monocrystalline","12V system ready"]],
 ["Mono Solar Panel 200W","panel-200w","PANEL-200",14500,18,"Solar Panels",["200W output","Monocrystalline","Weather-resistant frame"]],
 ["Hybrid Inverter 1.2kW","hybrid-inverter-1-2kw","INV-1200",18500,12,"Inverters",["1.2kW rated","Hybrid operation","LCD status display"]],
 ["Hybrid Inverter 3kW","hybrid-inverter-3kw","INV-3000",42500,8,"Inverters",["3kW rated","MPPT charging","Hybrid operation"]],
 ["Deep Cycle Battery 100Ah","deep-cycle-100ah","BAT-100",16800,16,"Batteries",["100Ah","12V","Deep-cycle use"]],
 ["Lithium Battery 100Ah","lithium-100ah","LFP-100",49500,9,"Batteries",["100Ah","Lithium storage","Battery-management ready"]],
 ["PWM Charge Controller 20A","pwm-controller-20a","CC-PWM20",2200,31,"Charge Controllers",["20A","12/24V","USB output"]],
 ["MPPT Charge Controller 40A","mppt-controller-40a","CC-MPPT40",8900,15,"Charge Controllers",["40A","MPPT","LCD monitoring"]],
 ["Solar Street Light 100W","street-light-100w","LIGHT-100",7200,22,"Solar Lights",["100W class","Outdoor","Integrated charging"]],
 ["Solar Flood Light 60W","flood-light-60w","LIGHT-60",4300,27,"Solar Lights",["60W class","Outdoor","Remote-control ready"]],
 ["Solar DC Cable 10m","solar-dc-cable-10m","ACC-CABLE10",1200,60,"Accessories",["10m length","Solar DC use","Connector-ready"]],
 ["MC4 Connector Pair","mc4-connector-pair","ACC-MC4",450,100,"Accessories",["1 pair","Weather-resistant","Solar DC connector"]],
 ["Home Solar Kit 500W","home-kit-500w","KIT-500",38500,10,"Solar Kits",["500W class","Home use","Bundle format"]],
 ["Home Solar Kit 1kW","home-kit-1kw","KIT-1000",74500,7,"Solar Kits",["1kW class","Home use","Bundle format"]],
 ["Commercial Solar Kit 3kW","commercial-kit-3kw","KIT-3000",214000,4,"Solar Kits",["3kW class","Office / shop","Bundle format"]]
];

async function main(){
  const map={};
  for(let i=0;i<categories.length;i++){
    const [name,slug]=categories[i];
    const c=await prisma.category.upsert({where:{slug},update:{name,sortOrder:i},create:{name,slug,sortOrder:i}});
    map[name]=c.id;
  }
  for(let i=0;i<products.length;i++){
    const [name,slug,sku,price,stock,categoryName,specs]=products[i];
    await prisma.product.upsert({
      where:{sku},
      update:{name,slug,price,stock,categoryId:map[categoryName],specs},
      create:{
        name,slug,sku,price,stock,categoryId:map[categoryName],specs,
        description:`${name} listed for solar energy system planning. Confirm sizing, compatibility and final specifications before purchase.`,
        rating:0,featured:i<6,warranty:"Warranty terms vary by supplier; confirm the applicable terms before purchase."
      }
    });
  }
  if(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){
    const passwordHash=await bcrypt.hash(process.env.ADMIN_PASSWORD,12);
    const email=process.env.ADMIN_EMAIL.toLowerCase();
    await prisma.user.upsert({
      where:{email},update:{role:"ADMIN",passwordHash},
      create:{name:"SolarHub Admin",email,passwordHash,role:"ADMIN"}
    });
  }
  console.log("Seed complete");
}
main().finally(()=>prisma.$disconnect());

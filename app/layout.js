import "./globals.css";
import Nav from "../components/Nav";
export const metadata={
  title:{default:"SolarHub BD — Solar Products in Bangladesh",template:"%s | SolarHub BD"},
  description:"Shop solar panels, inverters, batteries, controllers, lights, accessories and complete solar kits in Bangladesh.",
  keywords:["solar panel Bangladesh","solar inverter BD","solar battery Bangladesh","solar kit Bangladesh"],
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"),
  openGraph:{type:"website",siteName:"SolarHub BD"},
  robots:{index:true,follow:true}
};
export default function RootLayout({children}){
  const phone=process.env.NEXT_PUBLIC_SUPPORT_PHONE||"";const email=process.env.NEXT_PUBLIC_SUPPORT_EMAIL||"";const address=process.env.NEXT_PUBLIC_BUSINESS_ADDRESS||"";
  return <html lang="en"><body>
    <div className="topbar">Solar products · BDT pricing · Account-based ordering</div>
    <Nav/>{children}
    <footer className="footer shell">
      <div><a className="brand" href="/"><span className="brandMark">☀</span><span><b>SolarHub</b> <em>BD</em></span></a><p>Solar products, kits and installation requests for Bangladesh.</p></div>
      <div><h4>Shop</h4><a href="/shop">All products</a><a href="/service">Installation</a><a href="/faq">FAQ</a></div>
      <div><h4>Company</h4><a href="/about">About</a><a href="/policies">Policies</a><a href="/account">Account</a></div>
      <div><h4>Support</h4>{phone&&<a href={`tel:${phone}`}>{phone}</a>}{email&&<a href={`mailto:${email}`}>{email}</a>}{address&&<p>{address}</p>}{!phone&&!email&&!address&&<p>Contact details are managed by the store operator.</p>}</div>
    </footer>
  </body></html>
}

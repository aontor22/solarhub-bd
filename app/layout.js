import "./globals.css";
import Nav from "../components/Nav";
export const metadata={
  title:{default:"SolarHub BD — Solar Products in Bangladesh",template:"%s | SolarHub BD"},
  description:"Shop solar panels, inverters, batteries, controllers, lights, accessories and complete solar kits in Bangladesh.",
  keywords:["solar panel Bangladesh","solar inverter BD","solar battery Bangladesh","solar kit Bangladesh"],
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000")
};
export default function RootLayout({children}){
  return <html lang="en"><body>
    <div className="topbar">Bangladesh solar marketplace · BDT pricing · Secure account-based ordering</div>
    <Nav/>{children}
    <footer className="footer shell">
      <div><a className="brand" href="/"><span className="brandMark">☀</span><span><b>SolarHub</b> <em>BD</em></span></a><p>Solar products, kits and installation requests for Bangladesh.</p></div>
      <div><h4>Shop</h4><a href="/shop">All products</a><a href="/service">Installation</a><a href="/faq">FAQ</a></div>
      <div><h4>Company</h4><a href="/about">About</a><a href="/policies">Policies</a><a href="/account">Account</a></div>
      <div><h4>Before launch</h4><p>Add your verified address, phone, warranty, delivery and returns details.</p></div>
    </footer>
  </body></html>
}

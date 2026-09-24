export const dynamic="force-static";
const cats=[["Solar Panels","▦"],["Inverters","⌁"],["Batteries","▣"],["Charge Controllers","◫"],["Solar Lights","☼"],["Accessories","⛓"],["Solar Kits","⌂"]];
export default function Home(){
  return <main>
    <section className="hero shell">
      <div><span className="eyebrow">SOLAR PRODUCTS & INSTALLATION</span><h1>Build a more reliable solar setup.</h1><p>Browse panels, inverters, batteries, controllers, lighting, accessories and complete kits. See live stock, order in BDT and request installation support from one place.</p>
      <div className="actions"><a className="primaryBtn" href="/shop">Shop products</a><a className="secondaryBtn" href="/service">Request installation</a></div>
      <div className="trustRow"><span>✓ Live inventory</span><span>✓ Server-verified checkout</span><span>✓ Order tracking</span></div></div>
      <div className="solarScene" aria-label="Solar energy illustration"><div className="sun"></div><div className="panel p1"></div><div className="panel p2"></div><div className="battery">⚡</div></div>
    </section>
    <section className="shell section"><span className="eyebrow">SHOP BY CATEGORY</span><h2>Find the components you need</h2>
      <div className="categoryGrid">{cats.map(([c,i])=><a href={`/shop?category=${encodeURIComponent(c)}`} className="categoryCard" key={c}><span>{i}</span><b>{c}</b><small>Browse products →</small></a>)}</div>
    </section>
    <section className="darkBand"><div className="shell bandInner"><div><span className="eyebrow light">COMPLETE SOLAR KITS</span><h2>A simpler place to start.</h2><p>Browse bundled solar-kit options, then compare individual components when you need a more customized system.</p></div><a className="whiteBtn" href="/shop?category=Solar%20Kits">Explore kits</a></div></section>
    <section className="shell featureGrid section">
      <article><span>01</span><h3>Live stock</h3><p>Availability is rechecked at checkout so orders cannot rely only on stale browser data.</p></article>
      <article><span>02</span><h3>Flexible payments</h3><p>Use cash on delivery or configured manual payment methods with administrator verification.</p></article>
      <article><span>03</span><h3>Order history</h3><p>Signed-in customers can review order status, payment status and line-item details.</p></article>
      <article><span>04</span><h3>Installation requests</h3><p>Send project requirements directly to the service workflow for follow-up and scheduling.</p></article>
    </section>
  </main>
}

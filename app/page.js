export const dynamic="force-static";
const cats=[["Solar Panels","▦"],["Inverters","⌁"],["Batteries","▣"],["Charge Controllers","◫"],["Solar Lights","☼"],["Accessories","⛓"],["Solar Kits","⌂"]];
export default function Home(){
  return <main>
    <section className="hero shell">
      <div><span className="eyebrow">POWER YOUR HOME. PLAN YOUR SOLAR SYSTEM.</span><h1>Solar equipment for real projects in Bangladesh.</h1><p>Panels, inverters, batteries, controllers, lighting, accessories and complete kits—with inventory-aware ordering and account-based checkout.</p>
      <div className="actions"><a className="primaryBtn" href="/shop">Shop products</a><a className="secondaryBtn" href="/service">Request installation</a></div>
      <div className="trustRow"><span>✓ BDT pricing</span><span>✓ Inventory checked at checkout</span><span>✓ Persistent orders</span></div></div>
      <div className="solarScene"><div className="sun"></div><div className="panel p1"></div><div className="panel p2"></div><div className="battery">⚡</div></div>
    </section>
    <section className="shell section"><span className="eyebrow">SHOP BY CATEGORY</span><h2>Build the system you actually need</h2>
      <div className="categoryGrid">{cats.map(([c,i])=><a href={`/shop?category=${encodeURIComponent(c)}`} className="categoryCard" key={c}><span>{i}</span><b>{c}</b><small>Browse products →</small></a>)}</div>
    </section>
    <section className="darkBand"><div className="shell bandInner"><div><span className="eyebrow light">COMPLETE SOLAR KITS</span><h2>A simpler way to start.</h2><p>Use complete kit bundles as a starting point, then compare individual components for a more customized system.</p></div><a className="whiteBtn" href="/shop?category=Solar%20Kits">Explore kits</a></div></section>
    <section className="shell featureGrid section">
      <article><span>01</span><h3>Real accounts</h3><p>Customer registration, secure password hashing and signed session cookies.</p></article>
      <article><span>02</span><h3>Validated checkout</h3><p>Prices and stock are re-read from the database before an order is created.</p></article>
      <article><span>03</span><h3>Admin-ready data</h3><p>Products, stock, orders, users and service requests live in PostgreSQL.</p></article>
      <article><span>04</span><h3>Vercel-ready</h3><p>Deploy as a Next.js app and connect any production PostgreSQL provider.</p></article>
    </section>
  </main>
}

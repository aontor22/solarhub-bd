"use client";
import { useEffect,useMemo,useState } from "react";
const money=n=>"৳"+Number(n).toLocaleString("en-BD");
function addToCart(p){const c=JSON.parse(localStorage.getItem("shbd_cart")||"{}");c[p.id]=(c[p.id]||0)+1;localStorage.setItem("shbd_cart",JSON.stringify(c));window.dispatchEvent(new Event("shbd-cart"))}
export default function ShopClient(){
  const [products,setProducts]=useState([]),[loading,setLoading]=useState(true),[q,setQ]=useState(""),[category,setCategory]=useState("all"),[sort,setSort]=useState("featured");
  useEffect(()=>{const u=new URL(window.location.href),c=u.searchParams.get("category");if(c)setCategory(c);fetch("/api/products").then(r=>r.json()).then(d=>{setProducts(d.products||[]);setLoading(false)}).catch(()=>setLoading(false))},[]);
  const categories=[...new Set(products.map(p=>p.category.name))];
  const filtered=useMemo(()=>{let x=products.filter(p=>(category==="all"||p.category.name===category)&&(!q||`${p.name} ${p.description} ${p.category.name}`.toLowerCase().includes(q.toLowerCase())));if(sort==="priceAsc")x=[...x].sort((a,b)=>a.price-b.price);if(sort==="priceDesc")x=[...x].sort((a,b)=>b.price-a.price);if(sort==="rating")x=[...x].sort((a,b)=>b.rating-a.rating);return x},[products,q,category,sort]);
  return <main className="shell section"><div className="splitHeading"><div><span className="eyebrow">PRODUCT CATALOG</span><h1>Shop solar equipment</h1></div><p>Search and filter the live product catalog loaded from PostgreSQL.</p></div>
    <div className="toolbar"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search panels, inverter, battery..."/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="priceAsc">Price: low to high</option><option value="priceDesc">Price: high to low</option><option value="rating">Top rated</option></select></div>
    <p className="muted">{loading?"Loading inventory…":`${filtered.length} products`}</p>
    <div className="productGrid">{filtered.map(p=><article className="productCard" key={p.id}><div className="productMedia"><span>{p.category.name==="Solar Panels"?"▦":p.category.name==="Inverters"?"⌁":p.category.name==="Batteries"?"▣":p.category.name==="Solar Kits"?"⌂":"☼"}</span>{p.featured&&<b>Featured</b>}</div><div className="productBody"><small>{p.category.name}</small><h3>{p.name}</h3><div className="rating">★ {Number(p.rating).toFixed(1)}</div><p>{Array.isArray(p.specs)?p.specs.slice(0,2).join(" · "):""}</p><div className="priceRow"><strong>{money(p.price)}</strong><span className={p.stock>0?"inStock":"outStock"}>{p.stock>0?`${p.stock} in stock`:"Out of stock"}</span></div><button className="darkBtn full" disabled={p.stock<1} onClick={()=>addToCart(p)}>Add to cart</button></div></article>)}</div>
  </main>
}

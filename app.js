
const products = [
  {id:1,name:"Mono Solar Panel 100W",category:"Solar Panels",price:7800,rating:4.7,icon:"▦",badge:"Popular",stock:true,specs:["100W output","Monocrystalline","12V system ready"],summary:"Compact monocrystalline panel for small home and backup applications."},
  {id:2,name:"Mono Solar Panel 200W",category:"Solar Panels",price:14500,rating:4.8,icon:"▦",badge:"Featured",stock:true,specs:["200W output","Monocrystalline","Weather-resistant frame"],summary:"Higher-output panel for residential solar arrays and charging systems."},
  {id:3,name:"Hybrid Inverter 1.2kW",category:"Inverters",price:18500,rating:4.6,icon:"⌁",badge:"",stock:true,specs:["1.2kW rated","Hybrid operation","LCD status display"],summary:"Entry hybrid inverter suitable for smaller backup and solar systems."},
  {id:4,name:"Hybrid Inverter 3kW",category:"Inverters",price:42500,rating:4.9,icon:"⌁",badge:"Top rated",stock:true,specs:["3kW rated","MPPT charging","Hybrid operation"],summary:"Higher-capacity hybrid inverter for larger home or office loads."},
  {id:5,name:"Deep Cycle Battery 100Ah",category:"Batteries",price:16800,rating:4.6,icon:"▣",badge:"",stock:true,specs:["100Ah","12V","Deep-cycle use"],summary:"Deep-cycle storage battery for inverter and solar backup systems."},
  {id:6,name:"Lithium Battery 100Ah",category:"Batteries",price:49500,rating:4.9,icon:"▣",badge:"Premium",stock:true,specs:["100Ah","LiFePO4-style category","Battery management ready"],summary:"Long-cycle lithium storage option for modern solar backup systems."},
  {id:7,name:"PWM Charge Controller 20A",category:"Charge Controllers",price:2200,rating:4.4,icon:"◫",badge:"",stock:true,specs:["20A","12/24V","USB output"],summary:"Simple PWM controller for small panels and battery charging."},
  {id:8,name:"MPPT Charge Controller 40A",category:"Charge Controllers",price:8900,rating:4.8,icon:"◫",badge:"Efficient",stock:true,specs:["40A","MPPT","LCD monitoring"],summary:"MPPT controller designed for more efficient solar harvesting."},
  {id:9,name:"Solar Street Light 100W",category:"Solar Lights",price:7200,rating:4.5,icon:"☼",badge:"",stock:true,specs:["100W class","Outdoor","Integrated solar charging"],summary:"Outdoor solar street-light package for yards, roads and compounds."},
  {id:10,name:"Solar Flood Light 60W",category:"Solar Lights",price:4300,rating:4.5,icon:"☼",badge:"",stock:true,specs:["60W class","Outdoor","Remote control ready"],summary:"Compact solar flood light for exterior illumination."},
  {id:11,name:"Solar DC Cable 10m",category:"Accessories",price:1200,rating:4.3,icon:"〰",badge:"",stock:true,specs:["10m length","Solar DC use","Connector-ready"],summary:"DC cabling for solar panel and controller connections."},
  {id:12,name:"MC4 Connector Pair",category:"Accessories",price:450,rating:4.4,icon:"⛓",badge:"",stock:true,specs:["1 pair","Weather-resistant","Solar DC connector"],summary:"Connector pair for common solar DC wiring setups."},
  {id:13,name:"Home Solar Kit 500W",category:"Solar Kits",price:38500,rating:4.7,icon:"⌂",badge:"Starter kit",stock:true,specs:["500W class","Home use","Bundle format"],summary:"Starter bundle designed as a base for a compact home solar setup."},
  {id:14,name:"Home Solar Kit 1kW",category:"Solar Kits",price:74500,rating:4.8,icon:"⌂",badge:"Best seller",stock:true,specs:["1kW class","Home use","Bundle format"],summary:"Mid-range bundled solar system for larger daily household loads."},
  {id:15,name:"Commercial Solar Kit 3kW",category:"Solar Kits",price:214000,rating:4.9,icon:"▥",badge:"Commercial",stock:true,specs:["3kW class","Office / shop","Bundle format"],summary:"Commercial-scale starter bundle for shops, offices and larger loads."},
  {id:16,name:"DC Solar Fan",category:"Accessories",price:3900,rating:4.5,icon:"✺",badge:"",stock:true,specs:["DC power","Low energy use","Solar-system compatible"],summary:"Low-energy DC fan suitable for compatible solar and battery systems."}
];

const categories = [
  ["Solar Panels","▦"],["Inverters","⌁"],["Batteries","▣"],["Charge Controllers","◫"],
  ["Solar Lights","☼"],["Accessories","⛓"],["Solar Kits","⌂"]
];

const state = {
  cart: JSON.parse(localStorage.getItem("sh_cart") || "{}"),
  wishlist: JSON.parse(localStorage.getItem("sh_wishlist") || "[]"),
  compare: JSON.parse(localStorage.getItem("sh_compare") || "[]")
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => "৳" + Number(n).toLocaleString("en-BD");
const getProduct = id => products.find(p => p.id === Number(id));
const save = () => {
  localStorage.setItem("sh_cart", JSON.stringify(state.cart));
  localStorage.setItem("sh_wishlist", JSON.stringify(state.wishlist));
  localStorage.setItem("sh_compare", JSON.stringify(state.compare));
};

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1700);
}

function renderCategories(){
  $("#categoryGrid").innerHTML = categories.map(([name,icon])=>{
    const count=products.filter(p=>p.category===name).length;
    return `<button class="category-card" data-category-jump="${name}">
      <span class="category-icon">${icon}</span><strong>${name}</strong><small>${count} products</small>
    </button>`;
  }).join("");
  $("#categoryFilter").innerHTML += categories.map(([name])=>`<option value="${name}">${name}</option>`).join("");
}

function renderProducts(){
  const q=$("#searchInput").value.trim().toLowerCase();
  const cat=$("#categoryFilter").value;
  const price=$("#priceFilter").value;
  const sort=$("#sortSelect").value;
  let list=products.filter(p=>{
    const text=[p.name,p.category,...p.specs,p.summary].join(" ").toLowerCase();
    let ok=!q||text.includes(q);
    ok=ok&&(cat==="all"||p.category===cat);
    if(price!=="all"){const [min,max]=price.split("-").map(Number);ok=ok&&p.price>=min&&p.price<=max}
    return ok;
  });
  if(sort==="priceAsc") list.sort((a,b)=>a.price-b.price);
  if(sort==="priceDesc") list.sort((a,b)=>b.price-a.price);
  if(sort==="rating") list.sort((a,b)=>b.rating-a.rating);
  $("#resultCount").textContent=list.length;
  $("#productGrid").innerHTML=list.map(productCard).join("") || `<div class="empty">No products match your filters.</div>`;
}

function productCard(p){
  const wished=state.wishlist.includes(p.id), compared=state.compare.includes(p.id);
  return `<article class="product-card">
    <div class="product-media">
      ${p.badge?`<span class="badge">${p.badge}</span>`:""}
      <span>${p.icon}</span>
      <div class="product-actions-top">
        <button class="round-btn ${wished?"active":""}" data-wish="${p.id}" title="Wishlist">♡</button>
        <button class="round-btn ${compared?"active":""}" data-compare="${p.id}" title="Compare">⇄</button>
      </div>
    </div>
    <div class="product-body">
      <span class="product-category">${p.category}</span>
      <h3 class="product-title">${p.name}</h3>
      <div class="rating">★ ${p.rating.toFixed(1)}</div>
      <p class="spec-line">${p.specs.slice(0,2).join(" · ")}</p>
      <div class="price-line"><span class="price">${money(p.price)}</span><span class="stock">${p.stock?"In stock":"Out of stock"}</span></div>
      <div class="product-footer">
        <button class="add-btn" data-add="${p.id}">Add to cart</button>
        <button class="view-btn" data-view="${p.id}">View</button>
      </div>
    </div>
  </article>`;
}

function addToCart(id,qty=1){
  state.cart[id]=(state.cart[id]||0)+qty; save(); updateUI(); toast("Added to cart");
}
function changeQty(id,delta){
  state.cart[id]=(state.cart[id]||0)+delta;
  if(state.cart[id]<=0) delete state.cart[id];
  save(); updateUI();
}
function toggleWish(id){
  const i=state.wishlist.indexOf(id);
  if(i>=0) state.wishlist.splice(i,1); else state.wishlist.push(id);
  save(); updateUI(); toast(i>=0?"Removed from wishlist":"Added to wishlist");
}
function toggleCompare(id){
  const i=state.compare.indexOf(id);
  if(i>=0) state.compare.splice(i,1);
  else if(state.compare.length<3) state.compare.push(id);
  else { toast("Compare up to 3 products"); return; }
  save(); updateUI();
}

function cartTotals(){
  return Object.entries(state.cart).reduce((acc,[id,qty])=>{
    const p=getProduct(id); if(!p)return acc;
    acc.items+=qty; acc.total+=p.price*qty; return acc;
  },{items:0,total:0});
}

function renderCart(){
  const entries=Object.entries(state.cart);
  $("#cartItems").innerHTML=entries.length?entries.map(([id,qty])=>{
    const p=getProduct(id); return `<div class="cart-item">
      <div class="mini-media">${p.icon}</div>
      <div><h4>${p.name}</h4><small>${money(p.price)} each</small></div>
      <div class="qty"><button data-qty="${p.id}" data-delta="-1">−</button><strong>${qty}</strong><button data-qty="${p.id}" data-delta="1">+</button></div>
    </div>`;
  }).join(""):`<div class="empty">Your cart is empty.</div>`;
  const t=cartTotals(); $("#cartCount").textContent=t.items; $("#cartTotal").textContent=money(t.total);
}

function renderWishlist(){
  $("#wishlistCount").textContent=state.wishlist.length;
  $("#wishlistItems").innerHTML=state.wishlist.length?state.wishlist.map(id=>{
    const p=getProduct(id);return `<div class="wish-item">
      <div class="mini-media">${p.icon}</div><div><h4>${p.name}</h4><small>${money(p.price)}</small></div>
      <button class="round-btn" data-add="${p.id}">+</button>
    </div>`;
  }).join(""):`<div class="empty">No saved products yet.</div>`;
}

function renderCompare(){
  $("#compareCount").textContent=state.compare.length;
  $("#compareItems").innerHTML=state.compare.length?state.compare.map(id=>{
    const p=getProduct(id);return `<div class="compare-card">
      <div class="mini-media">${p.icon}</div>
      <h3>${p.name}</h3><strong>${money(p.price)}</strong>
      <dl><dt>Category</dt><dd>${p.category}</dd><dt>Rating</dt><dd>★ ${p.rating}</dd>
      ${p.specs.map((s,i)=>`<dt>Spec ${i+1}</dt><dd>${s}</dd>`).join("")}</dl>
      <button class="secondary-btn full" data-compare="${p.id}">Remove</button>
    </div>`;
  }).join(""):`<div class="empty">Add up to three products to compare.</div>`;
}

function renderAdmin(){
  const orders=JSON.parse(localStorage.getItem("sh_orders")||"[]");
  const requests=JSON.parse(localStorage.getItem("sh_requests")||"[]");
  $("#adminProducts").textContent=products.length;
  $("#adminOrders").textContent=orders.length;
  $("#adminRequests").textContent=requests.length;
  $("#adminCartValue").textContent=money(cartTotals().total);
  $("#adminOrderList").innerHTML=orders.slice(-5).reverse().map(o=>`<div class="admin-row"><div><strong>${o.id}</strong><br><small>${o.name} · ${o.payment}</small></div><strong>${money(o.total)}</strong></div>`).join("")||`<div class="empty">No demo orders yet.</div>`;
  $("#adminRequestList").innerHTML=requests.slice(-5).reverse().map(r=>`<div class="admin-row"><div><strong>${r.name}</strong><br><small>${r.project} · ${r.location||"Location not set"}</small></div><small>${r.date||"No date"}</small></div>`).join("")||`<div class="empty">No service requests yet.</div>`;
}

function updateUI(){renderProducts();renderCart();renderWishlist();renderCompare();renderAdmin()}

function openPanel(id){
  $$(".drawer").forEach(x=>x.classList.remove("open")); $$(".modal").forEach(x=>x.classList.remove("show"));
  const el=$("#"+id); if(el.classList.contains("drawer"))el.classList.add("open"); else el.classList.add("show");
  el.setAttribute("aria-hidden","false"); $("#overlay").classList.add("show");
}
function closePanels(){
  $$(".drawer").forEach(x=>{x.classList.remove("open");x.setAttribute("aria-hidden","true")});
  $$(".modal").forEach(x=>{x.classList.remove("show");x.setAttribute("aria-hidden","true")});
  $("#overlay").classList.remove("show");
}

function showProduct(id){
  const p=getProduct(id);
  $("#productModalContent").innerHTML=`<div class="product-modal-layout">
    <div class="product-modal-media">${p.icon}</div>
    <div class="product-modal-info">
      <span class="product-category">${p.category}</span><h2>${p.name}</h2>
      <div class="rating">★ ${p.rating.toFixed(1)} · ${p.stock?"In stock":"Out of stock"}</div>
      <p>${p.summary}</p><h3>${money(p.price)}</h3>
      <h4>Key specifications</h4><ul>${p.specs.map(s=>`<li>${s}</li>`).join("")}</ul>
      <div class="hero-actions">
        <button class="primary-btn" data-add="${p.id}">Add to cart</button>
        <button class="secondary-btn" data-wish="${p.id}">♡ Wishlist</button>
        <button class="secondary-btn" data-compare="${p.id}">⇄ Compare</button>
      </div>
      <p class="tiny">Demo product content. Replace specifications, brand, warranty and delivery information with your verified catalog data before launch.</p>
    </div></div>`;
  openPanel("productModal");
}

function openCheckout(){
  const t=cartTotals(); if(!t.items){toast("Your cart is empty");return}
  $("#checkoutSummary").innerHTML=`<div class="total-row"><span>${t.items} item${t.items>1?"s":""}</span><strong>${money(t.total)}</strong></div>`;
  openPanel("checkoutModal");
}

document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"); if(add){addToCart(Number(add.dataset.add));return}
  const wish=e.target.closest("[data-wish]"); if(wish){toggleWish(Number(wish.dataset.wish));return}
  const comp=e.target.closest("[data-compare]"); if(comp){toggleCompare(Number(comp.dataset.compare));return}
  const view=e.target.closest("[data-view]"); if(view){showProduct(Number(view.dataset.view));return}
  const qty=e.target.closest("[data-qty]"); if(qty){changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));return}
  const jump=e.target.closest("[data-category-jump]"); if(jump){
    $("#categoryFilter").value=jump.dataset.categoryJump; renderProducts(); location.hash="shop"; return;
  }
  const close=e.target.closest("[data-close]"); if(close){closePanels();return}
});
$("#searchInput").addEventListener("input",renderProducts);
$("#categoryFilter").addEventListener("change",renderProducts);
$("#priceFilter").addEventListener("change",renderProducts);
$("#sortSelect").addEventListener("change",renderProducts);
$("#cartBtn").addEventListener("click",()=>openPanel("cartDrawer"));
$("#wishlistBtn").addEventListener("click",()=>openPanel("wishlistDrawer"));
$("#compareBtn").addEventListener("click",()=>openPanel("compareDrawer"));
$("#checkoutBtn").addEventListener("click",openCheckout);
$("#overlay").addEventListener("click",closePanels);

$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  const fd=new FormData(e.currentTarget),t=cartTotals();
  const orders=JSON.parse(localStorage.getItem("sh_orders")||"[]");
  const order={
    id:"SHBD-"+String(Date.now()).slice(-7),name:fd.get("name"),phone:fd.get("phone"),
    address:fd.get("address"),district:fd.get("district"),payment:fd.get("payment"),
    total:t.total,items:{...state.cart},createdAt:new Date().toISOString()
  };
  orders.push(order);localStorage.setItem("sh_orders",JSON.stringify(orders));
  state.cart={};save();e.currentTarget.reset();closePanels();updateUI();toast(`Order ${order.id} created`);
});

$("#serviceForm").addEventListener("submit",e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);
  const requests=JSON.parse(localStorage.getItem("sh_requests")||"[]");
  const req=Object.fromEntries(fd.entries());req.createdAt=new Date().toISOString();
  requests.push(req);localStorage.setItem("sh_requests",JSON.stringify(requests));
  $("#serviceMessage").textContent="Request saved. Your team can now review it in the Admin demo.";
  e.currentTarget.reset();renderAdmin();
});
$("#newsletterForm").addEventListener("submit",e=>{e.preventDefault();e.currentTarget.reset();toast("Subscription captured in demo UI")});

renderCategories();updateUI();$("#year").textContent=new Date().getFullYear();
if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(()=>{})}

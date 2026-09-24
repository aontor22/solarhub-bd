"use client";
import { useEffect, useState } from "react";
export default function Nav(){
  const [count,setCount]=useState(0),[open,setOpen]=useState(false),[user,setUser]=useState(null);
  const refresh=()=>{try{const c=JSON.parse(localStorage.getItem("shbd_cart")||"{}");setCount(Object.values(c).reduce((a,b)=>a+Number(b||0),0))}catch{setCount(0)}};
  useEffect(()=>{refresh();fetch("/api/auth/me").then(r=>r.json()).then(d=>setUser(d.user||null)).catch(()=>{});window.addEventListener("shbd-cart",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("shbd-cart",refresh);window.removeEventListener("storage",refresh)}},[]);
  const close=()=>setOpen(false);
  return <header className="navWrap">
    <a className="brand" href="/" onClick={close}><span className="brandMark">☀</span><span><b>SolarHub</b> <em>BD</em></span></a>
    <button className="menuBtn" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>☰</button>
    <nav className={open?"navOpen":""}><a onClick={close} href="/shop">Shop</a><a onClick={close} href="/service">Installation</a><a onClick={close} href="/about">About</a><a onClick={close} href="/faq">FAQ</a>{user?.role==="ADMIN"&&<a onClick={close} href="/admin">Admin</a>}<a className="mobileOnly" onClick={close} href="/account">Account</a></nav>
    <div className="navActions"><a className="linkBtn" href="/account">{user?"Account":"Sign in"}</a><a className="darkBtn" href="/checkout">Cart <span>{count}</span></a></div>
  </header>
}

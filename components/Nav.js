"use client";
import { useEffect, useState } from "react";
export default function Nav(){
  const [count,setCount]=useState(0);
  const refresh=()=>{try{const c=JSON.parse(localStorage.getItem("shbd_cart")||"{}");setCount(Object.values(c).reduce((a,b)=>a+b,0))}catch{setCount(0)}};
  useEffect(()=>{refresh();window.addEventListener("shbd-cart",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("shbd-cart",refresh);window.removeEventListener("storage",refresh)}},[]);
  return <header className="navWrap">
    <a className="brand" href="/"><span className="brandMark">☀</span><span><b>SolarHub</b> <em>BD</em></span></a>
    <nav><a href="/shop">Shop</a><a href="/service">Installation</a><a href="/about">About</a><a href="/faq">FAQ</a></nav>
    <div className="navActions"><a className="linkBtn" href="/account">Account</a><a className="darkBtn" href="/checkout">Cart <span>{count}</span></a></div>
  </header>
}

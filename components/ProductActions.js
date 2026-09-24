"use client";
import {useState} from "react";
export default function ProductActions({product}){const[msg,setMsg]=useState("");function add(){const c=JSON.parse(localStorage.getItem("shbd_cart")||"{}");c[product.id]=Math.min(product.stock,(Number(c[product.id])||0)+1);localStorage.setItem("shbd_cart",JSON.stringify(c));window.dispatchEvent(new Event("shbd-cart"));setMsg("Added to cart.")}return <div><button className="primaryBtn" disabled={product.stock<1} onClick={add}>{product.stock>0?"Add to cart":"Out of stock"}</button><span className="inlineMsg">{msg}</span></div>}

"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
const DURATION_MINUTES:Record<string,number>={half_hour:30,one_hour:60};
type ActiveSession={id:string;started_at:string;station:string|null;duration_type:string|null;price_jmd:number|null};
function subscribe(tick:()=>void){const timer=setInterval(tick,1000);return ()=>clearInterval(timer);}
const snapshot=()=>Math.floor(Date.now()/1000);
const serverSnapshot=()=>0;
function SessionRow({session}:{session:ActiveSession}){
 const now=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
 const notified=useRef(false);
 const duration=session.duration_type?DURATION_MINUTES[session.duration_type]:undefined;
 const remaining=now&&duration?Math.floor(Date.parse(session.started_at)/1000+duration*60-now):null;
 const expired=remaining!==null&&remaining<=0;
 useEffect(()=>{
  if(expired&&!notified.current){notified.current=true;
   if("Notification" in window&&Notification.permission==="granted") new Notification("Session ended",{body:`${session.station??"Session"} time is up!`,icon:"/icon.png"});
  }
 },[expired,session.station]);
 const countdown=remaining===null?"Loading timer…":`${remaining<0?"-":""}${Math.floor(Math.abs(remaining)/60)}:${String(Math.abs(remaining)%60).padStart(2,"0")}`;
 return <div className={`studio-card space-y-1 ${expired?"!border-red":""}`}>
  <p className="font-semibold">Drop-in {session.station?`· ${session.station}`:""} <span className="studio-money">{session.price_jmd!=null?`J$${session.price_jmd}`:""}</span></p>
  <p className="studio-figures">{expired?"OVERTIME ":""}{duration?countdown:"No duration set"}</p>
 </div>;
}
export default function SessionTimer({sessions}:{sessions:ActiveSession[]}){
 const [notificationMessage,setNotificationMessage]=useState("");
 if(!sessions.length)return null;
 return <div className="space-y-2">
  <button type="button" className="studio-btn studio-btn-secondary studio-btn-sm" onClick={async()=>{
   if(!("Notification" in window)){setNotificationMessage("This browser does not support notifications.");return;}
   const permission=await Notification.requestPermission();setNotificationMessage(permission==="granted"?"Session notifications enabled.":"Keep this screen open to see session timers.");
  }}>Enable session notifications</button>
  {notificationMessage&&<p role="status">{notificationMessage}</p>}
  {sessions.map(session=><SessionRow key={session.id} session={session}/>)}
 </div>;
}

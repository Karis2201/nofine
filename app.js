(function(){
"use strict";
const B=window.NoFine,$=id=>document.getElementById(id);
const esc=v=>String(v==null?"":v).replace(/[&<>"'`]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"}[c]));
const fmt=n=>String(Math.round(Number(n||0))).replace(/\B(?=(\d{3})+(?!\d))/g,".");
const ICON={check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
 pin:'<svg viewBox="0 0 24 24"><path d="M12 22s-7.5-6.6-7.5-12a7.5 7.5 0 0 1 15 0c0 5.4-7.5 12-7.5 12Z"/><circle cx="12" cy="10" r="2.6" fill="#fff" stroke="none"/></svg>',
 ticks:'<svg viewBox="0 0 18 11"><path d="m1 6 3 3 6-7M7 9l1 1 7-8"/></svg>',road:'<svg viewBox="0 0 24 24"><path d="M5 21 9 3M19 21 15 3M12 5v2M12 11v2M12 17v2"/></svg>'};
let st,cur,typingDelay=0;
const DEMO=[ // hermt: tilbúnar prufuleigur
 {plate:"AB-412",renter:"J. Smith (US)",from:"2026-10-15",to:"2026-10-22",fees:[{kind:"parking",name:"Þingvellir",amount:1000,receipt:"DM-0101"},{kind:"parking",name:"Geysir",amount:1000,receipt:"DM-0102"},{kind:"street",name:"Reykjavík miðbær P1",amount:2070,receipt:"DM-0103"}],gaps:1,damage:0,demo:true},
 {plate:"KX-908",renter:"L. Müller (DE)",from:"2026-10-17",to:"2026-10-24",fees:[{kind:"parking",name:"Reynisfjara",amount:1000,receipt:"DM-0201"},{kind:"toll",name:"Vaðlaheiðargöng",amount:2216,receipt:"DM-0202"}],gaps:0,damage:1,demo:true}];
function clockStr(){const m=9*60+41+Math.round(st.clock*60);const h=Math.floor(m/60)%24,mm=m%60;return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0");}
function el(cls,html){const d=document.createElement("div");d.className="m "+cls;d.innerHTML=html;$("chat").appendChild(d);$("chat").scrollTop=1e9;return d;}
function receiptCard(t){
 let m=t.match(/^(✅|⏹️)\s*([^:]+):\s*(.+?),\s*(?:([\d.]+)\s*(?:h|klst\.|Std\.),\s*)?(\d+)\s*kr/u);
 if(!m) return "";
 return `<div class="rc"><div class="ic">${m[1]==="✅"?ICON.check:ICON.stop}</div><div><div class="a">${fmt(m[5])} kr.</div><div class="l">${esc(m[3])}${m[4]?" · "+esc(m[4])+" h":""}</div></div></div>`;}
function bot(t){
 let card=receiptCard(t);
 if(!card&&/^🛣️/u.test(t)) card=`<div class="rc warn"><div class="ic">${ICON.road}</div><div><div class="a">${esc((t.match(/^🛣️\s*([^:]+)/u)||[])[1]||"")}</div><div class="l">Toll · ${/camera|myndavél|Kamera/.test(t)?"auto-billed":"needs confirmation"}</div></div></div>`;
 const d=el("bot",`${card?'<div class="card-x">'+card+'</div>':""}<span class="txt">${esc(t)}</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="t">${clockStr()}</span>`);
 d.classList.add("typing");const wait=typingDelay;typingDelay+=650;
 setTimeout(()=>{d.classList.remove("typing");$("chat").scrollTop=1e9;},wait+550);
}
function me(t,loc){
 let inner=esc(t);
 if(loc){const sp=window.PARKING_DB.find(s=>s.id===loc);inner=`<div class="loc"><div class="map"><span class="pin">${ICON.pin}</span></div><div class="cap"><b>${sp?esc(sp.name):"Dropped pin"}</b><span>${esc(t.replace(/^📍\s*Location:\s*/,""))}</span></div></div>`;}
 el("me",`<span class="txt">${inner}</span><span class="t">${clockStr()} ${ICON.ticks}</span>`);}
function sys(t){const d=document.createElement("div");d.className="m sys";d.textContent=t;$("chat").appendChild(d);$("chat").scrollTop=1e9;}
function out(list){typingDelay=0;list.forEach(r=>r.startsWith("(")?sys(r):bot(r));chips(list[list.length-1]||"");refresh();}
function chips(last){
 const c=$("chips");let opts=[];
 if(/YES or NO/.test(last))opts=["YES","NO"];else if(/JÁ eða NEI|JÁ til/.test(last))opts=["JÁ","NEI"];else if(/JA oder NEIN|JA zum/.test(last))opts=["JA","NEIN"];else if(/Reply YES/.test(last))opts=["YES"];
 else if(st&&st.session)opts=[st.lang==="is"?"búinn":st.lang==="de"?"fertig":"done"];
 c.innerHTML=opts.map(o=>`<button class="chip" type="button">${esc(o)}</button>`).join("");
 c.querySelectorAll(".chip").forEach(b=>b.onclick=()=>say(b.textContent));}
function say(text,meta={}){me(text||"",meta.location);meta.driver=cur;out(B.handle(st,text,meta));}
function reset(){st=B.newState({plate:"LT-731",renter:"Driver 1"});cur="Driver 1";$("chat").innerHTML='<div class="day"><span>Today</span></div>';typingDelay=0;out(B.start(st));}
function kpi(v,k,badge){return `<div class="kpi"><div class="v">${v}</div><div class="k">${k}${badge?` <span class="badge">${badge}</span>`:""}</div></div>`;}
const KIND={parking:["Dagsstæði","b"],street:["Götustæði","g"],toll:["Veggjald","y"]};
function refresh(){
 $("drv").innerHTML=st.drivers.map(d=>`<option ${d===cur?"selected":""}>${esc(d)}</option>`).join("");
 $("clk").textContent=`Simulated time ${clockStr()} (+${Math.round(st.clock*60)} min)`;
 $("sbTime").textContent=clockStr();$("sub").textContent=st.online?(st.session?"parking session running":"online"):"waiting for network…";
 $("sbNet").textContent=st.online?"5G":"—";
 const nb=$("net");nb.classList.toggle("on",!st.online);nb.querySelector("span").textContent=st.online?"No signal":"Restore signal";
 const live={plate:st.plate,renter:st.drivers.join(", "),from:st.from,to:st.to,fees:st.fees,gaps:st.gaps.length,damage:st.damage.length,live:true,session:st.session};
 const rows=[live,...DEMO],sum=r=>r.fees.reduce((a,f)=>a+(f.amount||0),0);
 const allFees=rows.flatMap(r=>r.fees),total=allFees.reduce((a,f)=>a+(f.amount||0),0);
 const prevented=allFees.filter(f=>f.kind!=="toll").length;
 const status=r=>r.session?`<span class="tagx g">Götustæði í gangi · ${esc(r.session.sp.name)}</span>`:(r.live&&st.returned?'<span class="tagx">Skilað</span>':'<span class="tagx b">Í leigu</span>');
 const sessions=rows.flatMap(r=>r.fees.map(f=>`<tr><td><span class="plate">${esc(r.plate)}</span></td><td>${esc(f.name)}</td><td><span class="tagx ${KIND[f.kind][1]}">${KIND[f.kind][0]}${f.capped?" · hámark":""}</span></td><td class="r">${f.amount==null?"óstaðfest":fmt(f.amount)+" kr."}</td><td>${esc(f.receipt||"–")}${r.demo?' <span class="badge">hermt</span>':""}</td></tr>`)).join("");
 $("dash").innerHTML=`
 <div class="dh"><div><h2>Mælaborð bílaleigu</h2><div class="s">Lotus Car Rental · október 2026</div></div><span class="badge live">Uppfærist í rauntíma</span></div>
 <div class="kpis">${kpi(rows.length,"Virkir bílar/passar","2 hermt")}${kpi(allFees.length,"Greidd stæði/gjöld")}${kpi(fmt(total)+" kr.","Á lokareikninga")}${kpi(prevented,"Kröfur forðaðar","áætlun")}${kpi(0,"Kröfur borist","hermt")}${kpi(rows.reduce((a,r)=>a+r.gaps,0),"Óþekkt stæði (göt)")}</div>
 <div class="sec"><h3>Virkir bílar</h3><div class="tbl"><table><tr><th>Bílnúmer</th><th>Leigjandi/ökumenn</th><th>Tímabil</th><th class="r">Á lokareikning</th><th>Staða</th></tr>
 ${rows.map(r=>`<tr><td><span class="plate">${esc(r.plate)}</span>${r.demo?' <span class="badge">hermt</span>':""}</td><td>${esc(r.renter)}</td><td class="nw">${esc(r.from)} – ${esc(r.to)}</td><td class="r">${fmt(sum(r))} kr.</td><td>${status(r)}${r.damage?' <span class="tagx y">Tjón tilkynnt</span>':""}</td></tr>`).join("")}</table></div></div>
 <div class="sec"><h3>Stæði og gjöld eftir leigu</h3><div class="tbl"><table><tr><th>Bíll</th><th>Staður</th><th>Tegund</th><th class="r">Upphæð</th><th>Kvittun</th></tr>${sessions}</table></div></div>
 <div class="cols">
  <div class="sec"><h3>Beiðnir til bílaleigu</h3><ul class="list">${st.requests.map(q=>`<li>Framlenging til ${esc(q.to)} – ${esc(q.status)}</li>`).join("")||'<li class="e">Engar</li>'}</ul></div>
  <div class="sec"><h3>Óþekkt stæði (til að bæta í grunn)</h3><ul class="list">${st.gaps.map(g=>`<li>${esc(g.text)}</li>`).join("")||'<li class="e">Engin</li>'}</ul></div>
 </div>
 <div class="sec"><h3>Sjálfvirk veggjöld (myndavél, innheimt mánaðarlega)</h3><ul class="list">${st.trips.map(x=>`<li>${esc(x.name)}: ${fmt(x.amount)} kr. <span class="badge">óstaðfest</span></li>`).join("")||'<li class="e">Engin</li>'}</ul></div>
 <div class="sec"><h3>Mánaðarskýrsla – október 2026 <span class="badge">hermt</span></h3><div class="report">
  <div><b>${rows.length}</b>Passar · tekjuhlutur leigu: ÁGISKUN</div>
  <div><b>${allFees.length} · ${fmt(total)} kr.</b>Stæðis-/veggjöld greidd</div>
  <div><b>0 / ${prevented}</b>Kröfur borist (hermt) / forðaðar (áætlun)</div>
  <div><b>${rows.reduce((a,r)=>a+r.damage,0)} · ${st.pending?1:0}</b>Tjónstilkynningar · opin mál</div>
  <div><b>–</b>Ánægja leigjenda: ekki mæld í frumgerð</div></div></div>
 <p class="note">Öll verð í grunninum eru óstaðfest áætlun. Engar raunverulegar greiðslur.</p>`;}
$("loc").innerHTML=window.PARKING_DB.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
$("send").onclick=()=>{const v=$("inp").value.trim();if(v){say(v);$("inp").value="";}};
$("inp").onkeydown=e=>{if(e.key==="Enter")$("send").onclick();};
$("shareLoc").onclick=()=>{const s=window.PARKING_DB.find(x=>x.id===$("loc").value);say(`📍 Location: ${s.lat}, ${s.lon}`,{location:s.id});};
$("unknownLoc").onclick=()=>{st.gaps.push({text:"📍 64.5, -21.5 (óþekkt)",t:st.clock});say("📍 Location: 64.5, -21.5",{location:"unknown"});};
$("scan").onclick=()=>{me("🔗 https://nofine.is/a/"+st.token);out(B.scanQR(st,st.token));};
const tk=h=>{out(B.tick(st,h));};
$("tick15").onclick=()=>tk(0.25);$("tick").onclick=()=>tk(1);$("tick5").onclick=()=>{const r=[];for(let i=0;i<5;i++)r.push(...B.tick(st,1));out(r);};
$("net").onclick=()=>{const o=!st.online;const r=B.setOnline(st,o);sys(o?"Signal restored":"Signal lost – messages will be queued");out(r);};
$("alertBtn").onclick=()=>out(B.alert(st));
$("addDrv").onclick=()=>say("driver Driver 2");
$("drv").onchange=e=>cur=e.target.value;
$("photo").onchange=e=>{const f=[...e.target.files].map(x=>x.name);if(f.length)say("📷 "+f.join(", "),{photos:f});e.target.value="";};
$("returnBtn").onclick=()=>say(st.lang==="is"?"skila":st.lang==="de"?"Rückgabe":"return");
$("reset").onclick=reset;
const root=document.documentElement,saved=(()=>{try{return localStorage.getItem("nf-theme")}catch(e){return null}})();if(saved)root.dataset.theme=saved;
$("theme").onclick=()=>{root.dataset.theme=root.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("nf-theme",root.dataset.theme)}catch(e){}};
reset();
})();

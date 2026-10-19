import asyncio,sys
from playwright.async_api import async_playwright
JS="""()=>{const q=s=>document.querySelector(s).getBoundingClientRect();const a=[q('.controls'),q('.phone-wrap'),q('.dash-wrap')].map(r=>({l:r.left,t:r.top+scrollY,r:r.right,b:r.bottom+scrollY}));
const ov=(x,y)=>x.l<y.r-0.5&&y.l<x.r-0.5&&x.t<y.b-0.5&&y.t<x.b-0.5;const bad=[];const n=['controls','phone','dash'];
for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(ov(a[i],a[j]))bad.push(n[i]+'/'+n[j]);
const sw=document.documentElement.scrollWidth,iw=innerWidth;
const dr=document.querySelector('.dash-wrap').getBoundingClientRect();const tb=[...document.querySelectorAll('.dash-wrap table')].some(t=>t.getBoundingClientRect().right>dr.right+1&&getComputedStyle(t.parentElement).overflowX!=='auto');
return {bad,hscroll:sw>iw,tblOverflow:tb,cols:getComputedStyle(document.querySelector('.stage')).gridTemplateColumns}}"""
async def run(url):
  fails=0
  async with async_playwright() as p:
    b=await p.chromium.launch(channel="chrome")
    for w,h,dsf in [(1024,768,1),(1180,820,1),(1280,800,1),(1280,800,1.25),(1366,768,1),(1440,900,1),(1680,1050,1),(390,844,3)]:
      pg=await b.new_page(viewport={"width":int(w/dsf) if dsf==1.25 else w,"height":h},device_scale_factor=dsf,is_mobile=w<500)
      await pg.goto(url);await pg.wait_for_timeout(700)
      await pg.evaluate("()=>{document.getElementById('scan').click();document.getElementById('addDrv').click()}")
      for y in [0,400,900]:
        await pg.evaluate(f"scrollTo(0,{y})");await pg.wait_for_timeout(100)
        r=await pg.evaluate(JS)
        ok=not r["bad"] and not r["hscroll"] and not r["tblOverflow"]
        if not ok: fails+=1
      print(("OK  " if ok else "FAIL"),w,dsf,r)
      await pg.evaluate("scrollTo(0,0)")
      await pg.screenshot(path=f"screens/w{w}{'_z125' if dsf==1.25 else ''}.png",full_page=True)
    await b.close()
  print("LAYOUT FAILS:",fails)
asyncio.run(run(sys.argv[1] if len(sys.argv)>1 else "file:///workspace/nofine/index.html"))

import asyncio
from playwright.async_api import async_playwright
async def run():
  async with async_playwright() as p:
    b=await p.chromium.launch(channel="chrome")
    for name,vp,mob in [("desktop",{"width":1440,"height":900},False),("mobile",{"width":390,"height":844},True)]:
      pg=await b.new_page(viewport=vp,device_scale_factor=2 if mob else 1,is_mobile=mob,has_touch=mob)
      await pg.goto("file:///workspace/nofine/index.html");await pg.wait_for_timeout(900)
      c=lambda s: pg.evaluate(f"document.querySelector('{s}').click()")
      async def say(t):
        await pg.evaluate("t=>{const i=document.getElementById('inp');i.value=t;document.getElementById('send').click()}",t);await pg.wait_for_timeout(150)
      await c("#scan");await say("YES")
      await pg.select_option("#loc","seljalandsfoss");await c("#shareLoc");await say("YES")
      await say("I'm at P1");await say("yes");await c("#tick15");await say("done");await say("I'm at Reynisfjara")
      await pg.wait_for_timeout(2000)
      await pg.screenshot(path=f"screens/{name}.png")
      await pg.screenshot(path=f"screens/{name}_full.png",full_page=True)
    await b.close()
asyncio.run(run())

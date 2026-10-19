# NoFine – frumgerð (vinnuheiti)

Spjallmenni í WhatsApp-stíl sem sér um bílastæði fyrir leigjendur bílaleigubíla á Íslandi, ásamt einföldu mælaborði fyrir bílaleigu. Þetta er kyrrstætt vefforrit án byggingarskrefs og án greiddra API-lykla.

**Öll verð í stæðagrunninum eru „óstaðfest“ áætlun.** Rekstraraðilar og sum hnit eru líka áætlun og þarf að sannreyna þau.

## Keyrsla
- Opnaðu `index.html` í vafra. Engan netþjón þarf.
- Prófanir: `npm i jsdom@24`, síðan `node test.js`. Nýjasta jsdom virkar ekki á Node 20, svo notaðu útgáfu 24.

## Skrár og hlutverk
| Skrá | Hlutverk |
|---|---|
| `index.html` | Viðmót: sími með WhatsApp-spjalli, hermir (stjórnborð) og mælaborð. UI-merkingar eru á ensku. |
| `app.js` | Tengir viðmótið við vélina: hnappa (staðsetning, +1 klst., samband af/á, viðvörun, mynd, 2. ökumaður) og teiknar mælaborðið á íslensku. |
| `bot.js` | Rökfræði spjallmennisins (`window.NoFine`). Hún er hrein, án DOM, og keyrir líka í node. |
| `data.js` | Stæðagrunnurinn sem `window.PARKING_DB` og veggjöldin sem `window.TOLLS`. Hann er JS en ekki JSON svo hann virki úr `file://`. |
| `parking_db.json` | Sömu gögn á JSON-sniði, til útflutnings. |
| `test.js` | 37 sjálfvirkar prófanir í jsdom. |

## Hvernig bot.js virkar
**Staða (`newState`):** tungumál, virkjun, bílnúmer og tímabil, ökumenn, samband (`online`) og biðröð. Einnig `pending`, sem er bið eftir JÁ/NEI, og `session`, sem er götustæði í gangi. Loks gjöld (`fees`) með kvittunarnúmeri, göt (óþekkt stæði), tjón og hermd klukka (`clock`, í klst.).

**Flæði `handle(state, texti, meta)`:**
1. Ef ekkert samband er fara skilaboðin í biðröð. `setOnline(true)` afgreiðir biðröðina.
2. Tungumál er greint með lykilorðum (is/de/en; fr og es falla á ensku). Staðarnöfn eru fjarlægð áður en greint er, svo „Vaðlaheiðargöng“ skipti ekki yfir í íslensku.
3. Öryggisreglur eru skoðaðar fyrst: kortanúmer, akstur, endurgreiðsla/sekt/trygging og lögfræði fá staðlað svar.
4. Ef spjallið er óvirkt þarf JÁ. Þá kemur staðfesting á bíl og tímabili og ábending um gjaldskyld stæði.
5. Ef `pending` er virkt:
   - JÁ við ágiskun („did you mean“) leiðir aðeins til verðspurningar.
   - JÁ við verði greiðir dagsstæði eða ræsir götustæði.
   - JÁ við veggjaldi skráir það.
   - NEI hættir við.
   - Það þarf því alltaf tvö skref og aldrei er greitt út frá ágiskun.
6. Skipanir: DONE/BÚINN/FERTIG, EXTEND ÁÁÁÁ-MM-DD, DRIVER <nafn>, DAMAGE (síðan mynd), WEATHER, RETURN og HELP.
7. Veggjöld (`matchToll`) og staðarnöfn (`matchPlace`):
   - Nákvæm samsvörun við samheiti leiðir til verðspurningar.
   - Levenshtein-fjarlægð ≤2–3 leiðir til „did you mean X?“.
   - Annars er svarað með leiðbeiningu og staðurinn skráður sem gat.
8. Dagsstæði eru ekki greidd tvisvar sama dag fyrir sama bíl, óháð ökumanni.

**Aðrar aðgerðir:**
- `tick(state, klst)`: áminning eftir 2 klst. og sjálfvirk stöðvun við `cap_hours`.
- `doReturn`: stöðvar opið stæði, birtir samantekt gjalda og „engar kröfur“-staðfestingu.

## Gagnalíkan stæðagrunns
`{id, name, aliases[], lat, lon, operator, type: "daily"|"hourly", price_isk, cap_hours?, price_status: "óstaðfest", source: null}`.
Grunnurinn hefur 24 stæði, þar á meðal Þingvelli, Gullfoss, Geysi, Seljalandsfoss, Skógafoss, Reynisfjöru, Jökulsárlón, Diamond Beach, Skaftafell, Landmannalaugar, Kerið, Fjaðrárgljúfur, Dyrhólaey, KEF, Reykjavík P1–P4, Hörpu, Hallgrímskirkju, Kirkjufell, Hraunfossa, Dettifoss og Mývatn.
Valfrjálst svið `zone` er gjaldsvæði: aðeins er rukkað einu sinni á dag fyrir hvert svæði (Jökulsárlón og Diamond Beach eru á sama svæði).
Veggjöldin eru tvö, `{id, name, aliases[], price_isk, price_status, pay, mode}`: Vaðlaheiðargöng (2.216 kr. skv. Claude, `mode:"register"`) og Hornafjarðarfljót frá 1.9.2026 (1.500 kr. stök ferð undir 3,5 t skv. Claude, `mode:"auto"` = myndavélainnheimta á eiganda, aðeins upplýst og ferð skráð). Bæði verðin eru óstaðfest.

## Mælaborð (á íslensku)
- Lykiltölur: virkir bílar/passar, greidd stæði/gjöld, upphæð á lokareikninga, kröfur forðaðar (áætlun), kröfur borist og óþekkt stæði.
- Tafla yfir virka bíla.
- Stæði og gjöld eftir leigu, með kvittunum.
- Listi yfir óþekkt stæði.
- Mánaðarskýrsla.

## Prófanir (upphaflegu 37; nú alls 58, sjá breytingaskrá)
- **Virkjun og ferð (3):** activation, not active yet, car+tip.
- **Staðarnöfn og greiðsla (8):** did you mean, price confirm (no pay yet), paid receipt, no double pay, IS exact, IS cancel, DE, DE paid.
- **Götustæði (5):** street price, street start, reminder, stop, auto cap.
- **Óþekkt stæði (2):** unknown spot, unknown location.
- **Öryggisreglur (6):** card refused, no refund promise, no legal advice, phone while driving, alert refs (umferdin.is/vedur.is/112), never says safe.
- **Tveir ökumenn (2):** 2nd driver, 2nd driver no double.
- **Veggjöld (3):** toll, toll ok, horna no price guess.
- **Leiga og samband (3):** extend, queued, flush.
- **Tjón (2):** damage prompt, photo ok.
- **Skil (1):** summary+noclaims.
- **Mælaborð og bannorð (2):** dashboard Icelandic + data, no forbidden phrases.

## Hermt
- Engar raunverulegar greiðslur og engin tenging við Parka, EasyPark, Checkit, Isavia, Caren eða WhatsApp.
- Veðurviðvörunin er tilbúin og send með hnappi.
- Klukkan er hermd og staðsetning er valin úr lista.
- Myndir eru aðeins skráðar með skráarnafni.
- Á mælaborðinu eru 2 tilbúnir prufubílar. „Kröfur forðaðar“ er áætlun og „0 kröfur borist“ er fast gildi.

## Þekktar takmarkanir
- **Verð og rekstraraðilar:** öll verð eru óstaðfest og rekstraraðilar áætlaðir. Sum hnit eru nálgun.
- **Tungumál:** greiningin byggir á lykilorðum, svo blandaður texti getur skipt um tungumál. Franska og spænska eru á ensku.
- **Staðarnöfn:** nafnaleitin er einföld og getur ruglað stuttum nöfnum.
- **Gögn:** ekkert vistast, allt hverfur við endurhleðslu, og það er einn leigjandi í einu.
- **Prófun:** aðeins prófað í jsdom, ekki í raunverulegum vafra.

## Breytingaskrá

### 19.10.2026 – lagfæringar eftir yfirferð Claude (hópar A og B)
**A. Fé og öryggi**
1. **Tvö götustæði:** ef nýtt götustæði er hafið á meðan annað er í gangi er það fyrra stöðvað og rukkað fyrst, svo það týnist aldrei.
2. **XSS:** allur texti frá leigjanda (nöfn ökumanna, óþekktir staðir, bílnúmer, kvittanir o.fl.) er nú kóðaður (`esc()`) áður en hann fer í `innerHTML` á mælaborðinu. Spjallið notar `textContent`.
3. **Framlenging:** leigjandinn getur aðeins sent *beiðni* til bílaleigunnar og tímabilið breytist ekki. Dagsetningin þarf að vera raunveruleg (t.d. er 2026-02-30 hafnað) og eftir núverandi lokadag. Beiðnir birtast á mælaborðinu.
4. **Lás eftir skil:** eftir RETURN er hvorki hægt að greiða, hefja stæði né skrá veggjald.
5. **Virkjun með tóka:** símann þarf að tengja við leigusamninginn með tóka úr QR-kóða eða hlekk (`https://nofine.is/a/<tóki>` eða `START <tóki>`). YES án gilds tóka er hafnað. Herminn er með hnappinn „Scan QR in car“.

**B. Rangar greiðslur**
6. **Viðvera á staðnum:** greiðsla er aðeins boðin þegar leigjandinn deilir staðsetningu eða segir skýrt „I'm at / parked at / ég er við / bin bei“.
   - Neitun („NOT at“, „ekki“, „nicht“) og framtíð („tomorrow“, „going to“, „á morgun“, „morgen“) leiða bara til upplýsinga.
   - Valinn er sá staður sem fylgir viðveruorðinu („I'm at Geysir, going to Gullfoss“ velur Geysi).
   - Ef aðeins staðarnafn er skrifað er spurt „ertu þar núna?“.
7. **Gjaldsvæði:** sviðið `zone` var bætt við. Jökulsárlón og Diamond Beach eru eitt svæði og eru rukkuð einu sinni á dag.
8. **Mínútugjald:** götustæði eru rukkuð á mínútu (lágmark 1 mínúta, t.d. 15 mín. á P1 = 173 kr.) í stað heillar klukkustundar. Herminn er með hnappinn „+15 min“.
9. **Veggjöld:**
   - Hornafjarðarfljót: aðeins upplýst og ferðin skráð (1.500 kr., óstaðfest), því innheimtan er sjálfvirk með myndavél mánaðarlega á eiganda. Ferðin birtist á mælaborðinu og í samantekt við skil.
   - Vaðlaheiðargöng: verð uppfært í 2.216 kr. (óstaðfest).

**Prófanir:** 21 nýrri prófun var bætt við og nú eru þær alls 58, sem allar standast. Fimm eldri prófunum var breytt vegna þess að gamla hegðunin var villan:
- Upphafsskilaboðin biðja nú um QR-skönnun.
- „extend“ er nú beiðni.
- Hornafjörður er nú sjálfvirk innheimta.
- Verð Vaðlaheiðarganga var uppfært.
- „P2“ einu sinni þarf nú staðfestingu á viðveru.

### 19.10.2026 – nýtt útlit (hópur E)
- **Nýtt útlit:** `style.css` var bætt við. Síðan er nú kynningarsíða með Inter-letri, dökku þema sjálfgefnu og ljósu þema með hnappi.
- **Sími:** iPhone-umgjörð með ekta WhatsApp-útliti. Í spjallinu eru:
  - bólur með hölum, tímastimplum og tvöföldum hökum,
  - „skrifar…“-hreyfimynd,
  - flýtisvör (JÁ/NEI, DONE),
  - staðsetningarspjöld með kortamynd,
  - kvittanaspjöld.
- **Demo controls:** snyrtilegt hliðarspjald í 5 skrefum með táknum.
- **Mælaborð:** í SaaS-stíl með KPI-spjöldum og töflum. Öll prufugögn og fastar tölur eru merkt „hermt“ eða „áætlun“.
- **Snjallsími:** síðan er að fullu skalanleg, síminn fer efst og spjallið nær yfir allan skjáinn.
- **Skjámyndir:** `screens/desktop.png` og `screens/mobile.png`, teknar með `python3 shoot.py` (Playwright + Chrome).

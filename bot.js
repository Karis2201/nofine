// NoFine bot engine – hrein rökfræði, keyrir í vafra og node.
(function(root){
const DB = () => root.PARKING_DB, TL = () => root.TOLLS;
const norm = s => s.toLowerCase().replace(/þ/g,"th").replace(/ð/g,"d").replace(/æ/g,"ae").replace(/ö/g,"o").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
function lev(a,b){const m=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t;}}return m[b.length];}
function detectLang(t){let l=" "+t.toLowerCase()+" ";for(const x of (DB()||[]).concat(TL()||[]))for(const a of x.aliases.concat([x.name]))l=l.split(a.toLowerCase()).join(" ");
 if(/[ðþæ]/.test(l)||/\b(ég|er|við|já|nei|takk|hvar|búinn|skila|bíl)\b/.test(l))return"is";
 if(/[äüß]/.test(l)||/\b(ich|bin|ja|nein|bitte|danke|wo|parken|fertig|bei|der|die|das|und)\b/.test(l))return"de";
 if(/\b(oui|je|suis|merci|non)\b/.test(l))return"fr";
 if(/\b(si|estoy|gracias|hola)\b/.test(l))return"es";
 if(/\b(i|i'm|im|the|at|is|my|can|where|yes|no|done|return|help|please|want|now|hello|hi|damage|driver|extend|toll|weather)\b/.test(l))return"en";
 return null;}
const S={
en:{act:"Hi! I'm NoFine – I handle parking for your rental car in Iceland. Reply YES to activate.",
 car:(p,f,t)=>`Car ${p} is registered to you from ${f} to ${t}. When you park, tap "share location" or type where you are.`,
 tip:"Tip: parking at e.g. Seljalandsfoss and Þingvellir is paid. I can pay for you with one reply – the rental company is billed, never you in this chat.",
 needAct:"Please reply YES to activate first.",
 found:(s,op,pr,ty)=>`📍 ${s} – operator: ${op}. Price: ${pr}${ty==="hourly"?" per hour (street/zone parking)":" per day"}. Shall I pay? Reply YES or NO.`,
 unver:" (estimate – not verified)", noPrice:"price not confirmed – I won't guess",
 dym:s=>`Did you mean ${s}? Reply YES or NO.`,
 unknown:"I don't have that place in my database, so I won't pay anything there. Look for signs or a QR/pay machine on site; operators are usually Parka, EasyPark or Checkit. I've logged this spot for the rental company.",
 paid:(s,a,r)=>`✅ Paid: ${s}, ${a} kr. Receipt ${r}. It will be added to your final bill with the rental company.`,
 started:(s,p,c)=>`▶️ Parking started at ${s} (${p} kr/h). Reply DONE when you leave. I will stop automatically after ${c} h at the latest.`,
 reminder:(s,h)=>`⏰ Still parked at ${s}? ${h} h so far. Reply DONE when you leave (only when you have stopped/aren't driving).`,
 stopped:(s,h,a,r)=>`⏹️ Stopped: ${s}, ${h} h, ${a} kr. Receipt ${r}.`,
 capped:(s,h,a,r)=>`⏹️ Auto-stopped at the ${h} h cap: ${s}, ${a} kr. Receipt ${r}.`,
 noSession:"No parking session is running.",
 cancel:"OK, nothing was paid.",
 alert:"⚠️ Weather/road alert (demo): wind warning for South Iceland. Check umferdin.is and vedur.is before driving. I can't tell whether a road is safe. Emergency: 112.",
 driving:"Please don't use your phone while driving. Reply when you have stopped safely.",
 card:"Please never send card numbers here. I don't need them – the rental company is the payer.",
 refund:"I can't promise refunds, that there will be no fines, or anything about insurance. Please contact the rental company directly for that.",
 legal:"I can't give legal advice. Please contact the rental company for disputes.",
 dmg:"Damage report: please send photo(s) of the damage, then a short description. Only when parked.",
 dmgOk:n=>`📸 ${n} photo(s) received and forwarded to the rental company with time and location. This is not an insurance assessment.`,
 drv:n=>`👥 Driver ${n} added to this car. Payments are shared, so nothing is paid twice.`,
 dup:s=>`${s} is already paid today for this car – I won't pay twice.`,
 ext:d=>`📅 Rental period updated: now ends ${d}.`,
 toll:(n,p,how)=>`🛣️ ${n}: ${p}. Payment: ${how}. Shall I register it for payment by the rental company? Reply YES or NO.`,
 tollOk:n=>`✅ ${n} registered for payment.`,
 queued:"(no signal – message queued, will be sent when you're back online)",
 flushed:n=>`📶 Back online – ${n} queued message(s) processed.`,
 summary:(l,t)=>`🧾 Return summary:\n${l}\nTotal to final bill: ${t} kr.`,
 noFees:"No parking or toll fees recorded.",
 noclaims:"✅ No outstanding claims recorded for your rental. If a claim from an operator arrives later, it is matched by plate and date and handled with the rental company. Thank you!",
 help:"You can: share location, type a place name, DONE, EXTEND YYYY-MM-DD, DRIVER <name>, TOLL <name>, DAMAGE, WEATHER, RETURN."},
is:{act:"Hæ! Ég er NoFine og sé um bílastæðin fyrir bílaleigubílinn þinn. Svaraðu JÁ til að virkja.",
 car:(p,f,t)=>`Bíll ${p} er skráður á þig frá ${f} til ${t}. Þegar þú leggur, ýttu á „deila staðsetningu“ eða skrifaðu hvar þú ert.`,
 tip:"Ábending: stæðin við t.d. Seljalandsfoss og Þingvelli kosta. Ég get greitt með einu svari – bílaleigan er rukkuð, aldrei þú í þessu spjalli.",
 needAct:"Svaraðu JÁ til að virkja fyrst.",
 found:(s,op,pr,ty)=>`📍 ${s} – rekstraraðili: ${op}. Verð: ${pr}${ty==="hourly"?" á klst. (götu-/svæðisstæði)":" á dag"}. Á ég að greiða? Svaraðu JÁ eða NEI.`,
 unver:" (áætlun – óstaðfest)", noPrice:"verð óstaðfest – ég giska ekki",
 dym:s=>`Áttu við ${s}? Svaraðu JÁ eða NEI.`,
 unknown:"Þessi staður er ekki í grunninum mínum svo ég greiði ekkert þar. Skoðaðu skilti eða greiðsluvél/QR á staðnum; rekstraraðilar eru oftast Parka, EasyPark eða Checkit. Ég skráði staðinn fyrir bílaleiguna.",
 paid:(s,a,r)=>`✅ Greitt: ${s}, ${a} kr. Kvittun ${r}. Bætist á lokareikning hjá bílaleigunni.`,
 started:(s,p,c)=>`▶️ Stæði hafið: ${s} (${p} kr/klst). Svaraðu BÚINN þegar þú ferð. Ég stöðva sjálfkrafa eftir mest ${c} klst.`,
 reminder:(s,h)=>`⏰ Ertu enn í stæði við ${s}? ${h} klst. hingað til. Svaraðu BÚINN þegar þú ferð (bara þegar þú ert kyrrstæð/ur).`,
 stopped:(s,h,a,r)=>`⏹️ Stöðvað: ${s}, ${h} klst., ${a} kr. Kvittun ${r}.`,
 capped:(s,h,a,r)=>`⏹️ Sjálfvirk stöðvun við ${h} klst. hámark: ${s}, ${a} kr. Kvittun ${r}.`,
 noSession:"Ekkert stæði er í gangi.",
 cancel:"Allt í lagi, ekkert var greitt.",
 alert:"⚠️ Veður-/færðarviðvörun (prufa): vindviðvörun á Suðurlandi. Skoðaðu umferdin.is og vedur.is áður en þú ekur. Ég get ekki sagt hvort vegur sé öruggur. Neyðarnúmer: 112.",
 driving:"Ekki nota símann undir stýri. Svaraðu þegar þú hefur stöðvað á öruggum stað.",
 card:"Aldrei senda kortanúmer hér. Ég þarf þau ekki – bílaleigan greiðir.",
 refund:"Ég get ekki lofað endurgreiðslu, að engin sekt komi eða neinu um tryggingar. Hafðu samband við bílaleiguna.",
 legal:"Ég veiti ekki lögfræðiráðgjöf. Hafðu samband við bílaleiguna vegna ágreinings.",
 dmg:"Tjónstilkynning: sendu mynd(ir) af tjóninu og stutta lýsingu. Aðeins þegar bíllinn er kyrrstæður.",
 dmgOk:n=>`📸 ${n} mynd(ir) mótteknar og sendar bílaleigunni með tíma og staðsetningu. Þetta er ekki tjónamat.`,
 drv:n=>`👥 Ökumanni ${n} bætt við bílinn. Greiðslur eru sameiginlegar svo ekkert er greitt tvisvar.`,
 dup:s=>`${s} er þegar greitt í dag fyrir þennan bíl – ég greiði ekki tvisvar.`,
 ext:d=>`📅 Leigutímabil uppfært: lýkur nú ${d}.`,
 toll:(n,p,how)=>`🛣️ ${n}: ${p}. Greiðsla: ${how}. Á ég að skrá það til greiðslu hjá bílaleigunni? Svaraðu JÁ eða NEI.`,
 tollOk:n=>`✅ ${n} skráð til greiðslu.`,
 queued:"(ekkert samband – skilaboð í biðröð, send þegar samband næst)",
 flushed:n=>`📶 Samband komið – ${n} skilaboð í biðröð afgreidd.`,
 summary:(l,t)=>`🧾 Samantekt við skil:\n${l}\nSamtals á lokareikning: ${t} kr.`,
 noFees:"Engin stæðis- eða veggjöld skráð.",
 noclaims:"✅ Engar opnar kröfur skráðar á leiguna þína. Ef krafa berst síðar er hún pöruð eftir bílnúmeri og dagsetningu og afgreidd með bílaleigunni. Takk fyrir!",
 help:"Þú getur: deilt staðsetningu, skrifað staðarnafn, BÚINN, FRAMLENGJA ÁÁÁÁ-MM-DD, ÖKUMAÐUR <nafn>, VEGGJALD <nafn>, TJÓN, VEÐUR, SKILA."},
de:{act:"Hallo! Ich bin NoFine und kümmere mich um das Parken mit deinem Mietwagen in Island. Antworte JA zum Aktivieren.",
 car:(p,f,t)=>`Auto ${p} ist vom ${f} bis ${t} auf dich registriert. Beim Parken tippe auf „Standort teilen“ oder schreibe, wo du bist.`,
 tip:"Tipp: Parken z. B. am Seljalandsfoss und in Þingvellir kostet. Ich kann mit einer Antwort zahlen – die Mietwagenfirma wird belastet, nie du in diesem Chat.",
 needAct:"Bitte antworte zuerst mit JA.",
 found:(s,op,pr,ty)=>`📍 ${s} – Betreiber: ${op}. Preis: ${pr}${ty==="hourly"?" pro Stunde (Zone/Straße)":" pro Tag"}. Soll ich zahlen? Antworte JA oder NEIN.`,
 unver:" (Schätzung – nicht bestätigt)", noPrice:"Preis nicht bestätigt – ich rate nicht",
 dym:s=>`Meintest du ${s}? Antworte JA oder NEIN.`,
 unknown:"Dieser Ort ist nicht in meiner Datenbank, daher zahle ich dort nichts. Achte auf Schilder oder Automaten/QR vor Ort; Betreiber sind meist Parka, EasyPark oder Checkit. Ich habe den Ort für die Mietwagenfirma notiert.",
 paid:(s,a,r)=>`✅ Bezahlt: ${s}, ${a} kr. Beleg ${r}. Wird auf deine Endabrechnung bei der Mietwagenfirma gesetzt.`,
 started:(s,p,c)=>`▶️ Parken gestartet: ${s} (${p} kr/Std.). Antworte FERTIG, wenn du losfährst. Spätestens nach ${c} Std. stoppe ich automatisch.`,
 reminder:(s,h)=>`⏰ Parkst du noch bei ${s}? Bisher ${h} Std. Antworte FERTIG (nur wenn du nicht fährst).`,
 stopped:(s,h,a,r)=>`⏹️ Gestoppt: ${s}, ${h} Std., ${a} kr. Beleg ${r}.`,
 capped:(s,h,a,r)=>`⏹️ Automatisch gestoppt (Obergrenze ${h} Std.): ${s}, ${a} kr. Beleg ${r}.`,
 noSession:"Kein Parkvorgang aktiv.",
 cancel:"OK, es wurde nichts bezahlt.",
 alert:"⚠️ Wetter-/Straßenwarnung (Demo): Sturmwarnung für Südisland. Prüfe umferdin.is und vedur.is vor der Fahrt. Ich kann nicht sagen, ob eine Straße sicher ist. Notruf: 112.",
 driving:"Bitte nutze das Handy nicht während der Fahrt. Antworte, wenn du sicher angehalten hast.",
 card:"Bitte sende hier niemals Kartennummern. Ich brauche sie nicht – die Mietwagenfirma zahlt.",
 refund:"Ich kann keine Erstattungen, keine Strafen-Freiheit und nichts zu Versicherungen versprechen. Bitte wende dich an die Mietwagenfirma.",
 legal:"Ich gebe keine Rechtsberatung. Bitte wende dich bei Streitfällen an die Mietwagenfirma.",
 dmg:"Schadensmeldung: bitte Foto(s) des Schadens und eine kurze Beschreibung senden. Nur im Stand.",
 dmgOk:n=>`📸 ${n} Foto(s) erhalten und mit Zeit und Ort an die Mietwagenfirma weitergeleitet. Keine Versicherungsbewertung.`,
 drv:n=>`👥 Fahrer ${n} hinzugefügt. Zahlungen werden geteilt, nichts wird doppelt bezahlt.`,
 dup:s=>`${s} ist heute für dieses Auto bereits bezahlt – ich zahle nicht doppelt.`,
 ext:d=>`📅 Mietzeit aktualisiert: endet jetzt am ${d}.`,
 toll:(n,p,how)=>`🛣️ ${n}: ${p}. Zahlung: ${how}. Soll ich es zur Zahlung durch die Mietwagenfirma registrieren? Antworte JA oder NEIN.`,
 tollOk:n=>`✅ ${n} zur Zahlung registriert.`,
 queued:"(kein Netz – Nachricht in Warteschlange)",
 flushed:n=>`📶 Wieder online – ${n} Nachricht(en) verarbeitet.`,
 summary:(l,t)=>`🧾 Rückgabe-Übersicht:\n${l}\nGesamt auf Endabrechnung: ${t} kr.`,
 noFees:"Keine Park- oder Mautgebühren erfasst.",
 noclaims:"✅ Keine offenen Forderungen für deine Miete erfasst. Kommt später eine Forderung, wird sie per Kennzeichen und Datum zugeordnet und mit der Mietwagenfirma geklärt. Danke!",
 help:"Möglich: Standort teilen, Ortsname, FERTIG, VERLÄNGERN JJJJ-MM-TT, FAHRER <Name>, MAUT <Name>, SCHADEN, WETTER, RÜCKGABE."}
};
S.fr=S.en; S.es=S.en; // ÁGISKUN: fr/es falla á ensku í frumgerð
const X={"en": {"scan": "Welcome to NoFine. Please scan the QR code in your car or open the link in your rental confirmation to connect this phone to your rental.", "badToken": "I can't link this phone to a rental without the code from the QR/link in your rental confirmation. Please scan the QR code in the car.", "here": "Are you at {s} right now (parked there)? Reply YES or NO.", "dymHere": "Did you mean {s} – and are you there right now? Reply YES or NO.", "future": "Noted: {s}. I only pay when you're actually there. When you've arrived and parked, share your location or write \"I'm at {s}\".", "neg": "OK – I won't pay anything for {s}. When you've parked somewhere, share your location or write where you are.", "extReq": "📨 Extension request to {d} sent to the rental company. Your rental period only changes once they confirm.", "extBad": "That date isn't valid for an extension. Please use YYYY-MM-DD, a real date after your current end date ({d}).", "locked": "Your rental has been returned, so I can't pay or start anything more. Contact the rental company if something is wrong.", "autoToll": "🛣️ {n}: billed automatically by camera, monthly, to the car's owner (the rental company) – nothing to pay here. Trip logged: {p}.", "zoneDup": "{s} is in the same fee zone as a place already paid today ({z}) – I won't pay twice."}, "is": {"scan": "Velkomin(n) í NoFine. Skannaðu QR-kóðann í bílnum eða opnaðu hlekkinn í leigustaðfestingunni til að tengja símann við leiguna.", "badToken": "Ég get ekki tengt símann við leigu án kóðans úr QR/hlekknum í leigustaðfestingunni. Skannaðu QR-kóðann í bílnum.", "here": "Ertu við {s} núna (búin/n að leggja)? Svaraðu JÁ eða NEI.", "dymHere": "Áttu við {s} – og ertu þar núna? Svaraðu JÁ eða NEI.", "future": "Skráð: {s}. Ég greiði bara þegar þú ert komin/n á staðinn. Deildu þá staðsetningu eða skrifaðu „ég er við {s}“.", "neg": "Allt í lagi – ég greiði ekkert fyrir {s}. Þegar þú hefur lagt, deildu staðsetningu eða skrifaðu hvar þú ert.", "extReq": "📨 Beiðni um framlengingu til {d} send bílaleigunni. Leigutímabilið breytist aðeins þegar hún staðfestir.", "extBad": "Þessi dagsetning gengur ekki. Notaðu ÁÁÁÁ-MM-DD, raunverulega dagsetningu eftir núverandi lokadag ({d}).", "locked": "Bílnum hefur verið skilað svo ég get ekki greitt eða hafið neitt meira. Hafðu samband við bílaleiguna ef eitthvað er að.", "autoToll": "🛣️ {n}: innheimt sjálfvirkt með myndavél, mánaðarlega, af eiganda bílsins (bílaleigunni) – ekkert að greiða hér. Ferð skráð: {p}.", "zoneDup": "{s} er á sama gjaldsvæði og staður sem þegar er greiddur í dag ({z}) – ég greiði ekki tvisvar."}, "de": {"scan": "Willkommen bei NoFine. Scanne den QR-Code im Auto oder öffne den Link in deiner Mietbestätigung, um dieses Handy mit deiner Miete zu verbinden.", "badToken": "Ohne den Code aus dem QR/Link deiner Mietbestätigung kann ich dieses Handy nicht verbinden. Bitte scanne den QR-Code im Auto.", "here": "Bist du gerade bei {s} (geparkt)? Antworte JA oder NEIN.", "dymHere": "Meintest du {s} – und bist du gerade dort? Antworte JA oder NEIN.", "future": "Notiert: {s}. Ich zahle nur, wenn du wirklich dort bist. Teile dann deinen Standort oder schreibe „Ich bin bei {s}“.", "neg": "OK – ich zahle nichts für {s}. Wenn du geparkt hast, teile deinen Standort oder schreibe, wo du bist.", "extReq": "📨 Verlängerungsanfrage bis {d} an die Mietwagenfirma gesendet. Die Mietzeit ändert sich erst nach deren Bestätigung.", "extBad": "Dieses Datum ist ungültig. Bitte JJJJ-MM-TT, ein echtes Datum nach deinem aktuellen Enddatum ({d}).", "locked": "Dein Mietwagen wurde zurückgegeben, ich kann nichts mehr bezahlen oder starten. Bitte wende dich an die Mietwagenfirma.", "autoToll": "🛣️ {n}: wird automatisch per Kamera monatlich beim Halter (Mietwagenfirma) abgerechnet – hier nichts zu zahlen. Fahrt notiert: {p}.", "zoneDup": "{s} liegt in derselben Gebührenzone wie ein heute bereits bezahlter Ort ({z}) – ich zahle nicht doppelt."}};
for(const k in X)S[k]=Object.assign({},S[k],X[k]);S.fr=S.en;S.es=S.en;
const F=(tpl,o)=>tpl.replace(/\{(\w)\}/g,(m,k)=>o[k]);
const YES=/^(yes|y|ja|já|jà|oui|si|sí|ok|jep)\b/i, NO=/^(no|nei|nein|non|n)\b/i;
function rid(st){return "NF-"+String(++st.seq).padStart(4,"0");}
function fmtPrice(sp,L){return sp.price_isk==null?L.noPrice:sp.price_isk+" kr"+(sp.price_status!=="staðfest"?L.unver:"");}
function matchPlace(text){
 const t=" "+norm(text)+" ";
 for(const sp of DB()) for(const a of sp.aliases.concat([sp.name])){const n=norm(a); if(n.length>=2 && t.includes(" "+n+" ")) return {exact:sp};}
 const toks=norm(text).split(" ").filter(w=>w.length>=4); let best=null;
 for(const sp of DB()) for(const a of sp.aliases){const n=norm(a); if(n.length<5||n.includes(" "))continue; for(const w of toks){const d=lev(w,n); const lim=n.length>=9?3:2; if(d<=lim&&(!best||d<best.d))best={d,sp};}}
 return best?{guess:best.sp}:null;}
function matchToll(text){const t=norm(text);for(const tl of TL())for(const a of tl.aliases)if(t.includes(norm(a))||norm(a).split(" ").some(w=>w.length>5&&t.split(" ").some(x=>lev(x,w)<=2)))return tl;return null;}
function newState(o={}){return {lang:"en",activated:false,token:o.token||"T7K2-LT731",tokenOk:false,requests:[],trips:[],plate:o.plate||"XX-123",from:o.from||"2026-10-19",to:o.to||"2026-10-26",renter:o.renter||"Renter",drivers:[o.renter||"Renter"],online:true,queue:[],pending:null,session:null,fees:[],gaps:[],damage:[],awaitingPhotos:false,returned:false,seq:0,clock:0,log:[]};}
function start(st){return [S[st.lang].scan];}
function scanQR(st,token){const L=S[st.lang];if(token&&token===st.token){st.tokenOk=true;return [L.act];}return [L.badToken];}
function validDate(d){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d);if(!m)return false;const x=new Date(Date.UTC(+m[1],m[2]-1,+m[3]));return x.getUTCFullYear()==+m[1]&&x.getUTCMonth()==m[2]-1&&x.getUTCDate()==+m[3];}
const zoneOf=sp=>sp.zone||sp.id;
function fmtH(h){return String(Math.round(h*100)/100);}
function addFee(st,kind,name,amount,extra={}){const r=rid(st);st.fees.push({kind,name,amount,receipt:r,day:Math.floor(st.clock/24),t:st.clock,driver:extra.driver||st.renter,...extra});return r;}
function confirmSpot(st,sp,L){
 if(st.returned) return [L.locked];
 const day=Math.floor(st.clock/24);
 if(sp.type==="daily"){const prev=st.fees.find(f=>f.zone===zoneOf(sp)&&f.day===day&&f.kind==="parking");
  if(prev) return [prev.spotId===sp.id?L.dup(sp.name):F(L.zoneDup,{s:sp.name,z:prev.name})];}
 st.pending={kind:"pay",sp}; return [L.found(sp.name,sp.operator,fmtPrice(sp,L),sp.type)];}
function handle(st,text,meta={}){
 if(!st.online){st.queue.push({text,meta});return [S[st.lang].queued];}
 const lg=detectLang(text); if(lg)st.lang=lg; const L=S[st.lang]; const raw=text.trim(), t=norm(raw);
 st.log.push({from:"renter",text:raw,t:st.clock});
 // öryggisreglur fyrst
 if(/\b(?:\d[ -]?){13,19}\b/.test(raw)||/\b(card number|kortanumer|kartennummer|cvv)\b/.test(t)) return [L.card];
 if(/\b(driving|keyri|ek nuna|undir styri|ich fahre|am fahren)\b/.test(t)) return [L.driving];
 if(/\b(refund|endurgreid|erstatt|insurance|trygging|versicherung|no fine|engin sekt)\w*/.test(t)) return [L.refund];
 if(/\b(lawyer|legal|sue|logfraed|kaera|anwalt|klage)\w*/.test(t)) return [L.legal];
 if(!st.activated){ let tk=raw.match(/(?:nofine\.is\/a\/|start\s+)([A-Z0-9-]+)/i); if(tk||meta.token) return scanQR(st,meta.token||tk[1]);
  if(!st.tokenOk) return [L.badToken];
  if(YES.test(raw)){st.activated=true;return [L.car(st.plate,st.from,st.to),L.tip];} return [L.needAct]; }
 if(meta.photos){ if(st.awaitingPhotos){st.damage.push({photos:meta.photos,t:st.clock,note:raw});st.awaitingPhotos=false;return [L.dmgOk(meta.photos.length)];} }
 if(st.pending){const p=st.pending;
  if(YES.test(raw)){st.pending=null;
   if(st.returned) return [L.locked];
   if(p.kind==="guess"||p.kind==="here") return confirmSpot(st,p.sp,L);
   if(p.kind==="toll"){addFee(st,"toll",p.tl.name,p.tl.price_isk,{status:p.tl.price_isk==null?"verð óstaðfest":"skráð"});return [L.tollOk(p.tl.name)];}
   if(p.kind==="pay"){const sp=p.sp;
    if(sp.price_isk==null) return [L.noPrice];
    if(sp.type==="daily"){const r=addFee(st,"parking",sp.name,sp.price_isk,{spotId:sp.id,zone:zoneOf(sp),operator:sp.operator,driver:meta.driver});return [L.paid(sp.name,sp.price_isk,r)];}
    const out=st.session?stopSession(st,false):[];
    st.session={sp,start:st.clock,reminded:false,driver:meta.driver};out.push(L.started(sp.name,sp.price_isk,sp.cap_hours));return out;}}
  if(NO.test(raw)){st.pending=null;return [L.cancel];}
 }
 if(/^(done|stop|buinn|haett|fertig|stopp)\b/.test(t)) return stopSession(st,false);
 if(meta.location&&st.returned) return [L.locked];
 if(meta.location){const sp=DB().find(s=>s.id===meta.location); return sp?confirmSpot(st,sp,L):[L.unknown];}
 let m;
 if((m=raw.match(/(extend|framlengja|verl[aä]ngern)\D*(\d{4}-\d{2}-\d{2})/i))){const d=m[2];if(!validDate(d)||d<=st.to)return [F(L.extBad,{d:st.to})];st.requests.push({type:"extend",to:d,status:"bíður staðfestingar",t:st.clock});return [F(L.extReq,{d})];}
 if((m=raw.match(/^(driver|ökumaður|okumadur|fahrer)\s+(.+)/i))){st.drivers.push(m[2]);return [L.drv(m[2])];}
 if(/\b(damage|tjon|schaden)\b/.test(t)){st.awaitingPhotos=true;return [L.dmg];}
 if(/\b(weather|road|vedur|faerd|wetter|strasse)\b/.test(t)) return [L.alert];
 if(/\b(return|skila|ruckgabe|skil)\b/.test(t)) return doReturn(st);
 if(/\b(help|hjalp|hilfe)\b/.test(t)) return [L.help];
 const tl=/\b(toll|veggjald|maut|gong|tunnel)\b/.test(t)||matchToll(raw)?matchToll(raw):null;
 if(tl&&tl.mode==="auto"){st.trips.push({name:tl.name,amount:tl.price_isk,t:st.clock});return [F(L.autoToll,{n:tl.name,p:tl.price_isk+" kr"+L.unver})];}
 if(tl&&st.returned) return [L.locked];
 if(tl){st.pending={kind:"toll",tl};return [L.toll(tl.name,tl.price_isk==null?L.noPrice:tl.price_isk+" kr"+L.unver,tl.pay)];}
 // B6: greiða aðeins ef leigjandi er á staðnum
 const PRES=/(i'?m at|i am at|im at|we'?re at|we are at|parked at|i'?m parked at|here at|ég er við|ég er á|ég er hjá|ég er í|við erum við|erum við|lagði við|lagt við|ich bin bei|ich bin am|ich bin an|bin bei|bin am|wir sind bei|wir sind am|parke bei|parke am|stehe bei|stehe am)\s+/i;
 const NEG=/\b(not|n't|never|ekki|nicht|kein|keine)\b|n't\b/i;
 const FUT=/\b(tomorrow|later|going to|gonna|will|next|tonight|plan|heading|á morgun|seinna|ætla|ætlum|förum|fer|á eftir|morgen|später|werden|fahren|gehen|nächste)\b/i;
 let seg=raw, pres=false; const pm=raw.match(PRES);
 if(pm){pres=true;seg=raw.slice(pm.index+pm[0].length).split(/[,.;!?]|\b(and then|then|going|next|and|og|svo|und|dann)\b/i)[0];}
 const mp=matchPlace(seg)||(pres?null:matchPlace(raw));
 if(mp){const sp=mp.exact||mp.guess;
  if(NEG.test(raw)) return [F(L.neg,{s:sp.name})];
  if(!pres&&FUT.test(raw)) return [F(L.future,{s:sp.name})];
  if(pres&&mp.exact) return confirmSpot(st,sp,L);
  if(st.returned) return [L.locked];
  if(sp.type==="daily"&&st.fees.some(f=>f.zone===zoneOf(sp)&&f.day===Math.floor(st.clock/24)&&f.kind==="parking")) return confirmSpot(st,sp,L);
  if(mp.guess){st.pending={kind:"guess",sp};return [pres?L.dym(sp.name):F(L.dymHere,{s:sp.name})];}
  st.pending={kind:"here",sp};return [F(L.here,{s:sp.name})];}
 st.gaps.push({text:raw,t:st.clock}); return [L.unknown];}
function stopSession(st,auto){const L=S[st.lang],s=st.session;if(!s)return [L.noSession];
 const mins=Math.min(Math.max(1,Math.ceil((st.clock-s.start)*60-1e-9)),s.sp.cap_hours*60),a=Math.round(mins*s.sp.price_isk/60),h=fmtH(mins/60);
 const r=addFee(st,"street",s.sp.name,a,{hours:h,capped:auto,spotId:s.sp.id,driver:s.driver});st.session=null;
 return [auto?L.capped(s.sp.name,h,a,r):L.stopped(s.sp.name,h,a,r)];}
function tick(st,hours=1){st.clock+=hours;const L=S[st.lang],out=[],s=st.session;
 if(s){const el=st.clock-s.start;
  if(el>=s.sp.cap_hours){st.clock=s.start+s.sp.cap_hours;out.push(...stopSession(st,true));st.clock=s.start+el;}
  else if(el>=2&&!s.reminded){s.reminded=true;out.push(L.reminder(s.sp.name,fmtH(el)));}}
 return out;}
function setOnline(st,on){st.online=on;if(!on)return [];const q=st.queue;st.queue=[];const out=[];for(const x of q)out.push(...handle(st,x.text,x.meta));out.unshift(S[st.lang].flushed(q.length));return out;}
function doReturn(st){const L=S[st.lang],out=[];if(st.session)out.push(...stopSession(st,false));
 st.returned=true;const tot=st.fees.reduce((a,f)=>a+(f.amount||0),0);
 const tripTxt=st.trips.map(x=>`\n• ${x.name}: ${x.amount} kr (auto/camera)`).join("");
 out.push(st.fees.length||st.trips.length?L.summary(st.fees.map(f=>`• ${f.name}: ${f.amount==null?"?":f.amount+" kr"} (${f.receipt})`).join("\n")+tripTxt,tot):L.noFees);
 out.push(L.noclaims);return out;}
function alert(st){return [S[st.lang].alert];}
const api={norm,lev,detectLang,matchPlace,matchToll,newState,start,scanQR,validDate,handle,tick,setOnline,alert,S};
if(typeof module!=="undefined")module.exports=api; root.NoFine=api;
})(typeof window!=="undefined"?window:globalThis);

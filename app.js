const ASSETS = [
  ["주식","국내 주식","KOSPI","KRX:KOSPI"],["주식","코스닥","KOSDAQ","KRX:KOSDAQ"],
  ["주식","미국 S&P 500","SPX","SP:SPX"],["주식","미국 나스닥 100","NDX","NASDAQ:NDX"],["주식","미국 중소형주","Russell 2000","TVC:RUT"],
  ["주식","유럽 주식","STOXX 600","TVC:SXXP"],["주식","일본 주식","Nikkei 225","TVC:NI225"],["주식","베트남 주식","VN Index","HOSE:VNINDEX"],
  ["주식","아시아 주식","AAXJ ETF proxy","NASDAQ:AAXJ"],["주식","아세안 주식","ASEA ETF proxy","NYSE:ASEA"],["주식","인도 주식","Nifty 50","NSE:NIFTY"],
  ["채권","국내 단기채","단기채 ETF proxy","KRX:153130"],["채권","국내 중기채","국고채 3년 ETF proxy","KRX:114260"],["채권","국내 장기채","국고채 10년 ETF proxy","KRX:148070"],
  ["채권","미국 단기국채","1-3Y Treasury ETF","NASDAQ:SHY"],["채권","글로벌 하이일드","High Yield ETF","NYSEARCA:HYG"],
  ["원자재","금","Gold Spot","OANDA:XAUUSD"],["원자재","구리","Copper Futures","COMEX:HG1!"],["원자재","원유","WTI Crude Futures","NYMEX:CL1!"],
  ["외환","달러/원","USD/KRW","FX_IDC:USDKRW"],["외환","엔/원","JPY/KRW","FX_IDC:JPYKRW"],["외환","유로/원","EUR/KRW","FX_IDC:EURKRW"],
  ["기타","글로벌 리츠","Vanguard REIT ETF proxy","NYSEARCA:VNQ"],["기타","S&P 커버드콜","Global X S&P 500 Covered Call","NASDAQ:XYLD"],["기타","나스닥 커버드콜","Global X Nasdaq 100 Covered Call","NASDAQ:QYLD"],["기타","미국 배당주","Schwab US Dividend Equity ETF proxy","NYSEARCA:SCHD"]
].map((a,i)=>({id:"a"+i,category:a[0],name:a[1],ticker:a[2],symbol:a[3]}));

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let selectedAsset = null;
let interval = "D";
let productTab = "fund";
let positions = JSON.parse(localStorage.getItem("ar_positions")||"[]");
let watch = JSON.parse(localStorage.getItem("ar_watch")||"[]");

function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function save(){localStorage.setItem("ar_positions",JSON.stringify(positions));localStorage.setItem("ar_watch",JSON.stringify(watch))}
function showPage(name){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+name));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name));window.scrollTo({top:0,behavior:"smooth"});if(name==="portfolio")renderPortfolio()}
function renderAssets(){
 const q=($("#assetSearch").value||"").toLowerCase(), cat=$("#categoryFilter").value;
 const list=ASSETS.filter(a=>(cat==="all"||a.category===cat)&&[a.name,a.ticker,a.symbol,a.category].join(" ").toLowerCase().includes(q));
 $("#assetList").innerHTML=list.map(a=>`<div class="asset-row"><div class="asset-main" data-asset="${a.id}"><div class="asset-name">${a.name}</div><div class="asset-meta">${a.category} · ${a.ticker}</div></div><span class="asset-status">판정 보류</span><button class="watch-btn ${watch.includes(a.id)?"on":""}" data-watch="${a.id}" aria-label="관심자산 등록">${watch.includes(a.id)?"★":"☆"}</button></div>`).join("")||'<div class="empty-mini">검색 결과가 없습니다.</div>';
 $("#assetCount").textContent=ASSETS.length;
 $("#positionAsset").innerHTML=ASSETS.map(a=>`<option value="${a.id}">${a.name} (${a.ticker})</option>`).join("");
}
function loadChart(a){
 selectedAsset=a;$("#chartTitle").textContent=a.name;$("#chartMeta").textContent=`${a.ticker} · ${a.symbol} · TradingView 차트`;
 $("#tvLink").href=`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(a.symbol)}`;
 $("#tvChart").innerHTML="";
 const iframe=document.createElement("iframe");iframe.title=`${a.name} 가격 차트`;iframe.loading="lazy";
 iframe.src=`https://s.tradingview.com/widgetembed/?frameElementId=tv_${a.id}&symbol=${encodeURIComponent(a.symbol)}&interval=${interval}&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=%230b1421&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FSeoul&withdateranges=1&hideideas=1&locale=kr`;
 iframe.allowFullscreen=true;$("#tvChart").appendChild(iframe);
}
function renderPortfolio(){
 $("#positionsList").innerHTML=positions.length?positions.map((p,i)=>{const a=ASSETS.find(x=>x.id===p.asset);return `<div class="position-item"><div><b>${a?.name||"삭제된 자산"}</b><small>${p.date} · ${Number(p.qty).toLocaleString()} 단위 × ${Number(p.price).toLocaleString()} · ${p.memo||"메모 없음"}</small></div><button class="delete-btn" data-delete="${i}">삭제</button></div>`}).join(""):'<div class="empty-mini">저장된 매입 기록이 없습니다.</div>';
 $("#watchlist").innerHTML=watch.length?watch.map(id=>{const a=ASSETS.find(x=>x.id===id);return a?`<div class="asset-row"><div class="asset-main" data-asset="${a.id}"><div class="asset-name">${a.name}</div><div class="asset-meta">${a.ticker} · ${a.symbol}</div></div><button class="watch-btn on" data-watch="${a.id}">★</button></div>`:""}).join(""):'<div class="empty-mini">시세 메뉴에서 별표를 눌러 관심자산을 등록하세요.</div>';
}
function renderQuotes(){
 const box=$("#marketQuotes");box.innerHTML="";
 const s=document.createElement("script");s.type="text/javascript";s.src="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";s.async=true;
 s.innerHTML=JSON.stringify({width:"100%",height:220, symbolsGroups:[{name:"주요 지수",originalName:"Indices",symbols:[{name:"SP:SPX",displayName:"S&P 500"},{name:"NASDAQ:NDX",displayName:"NASDAQ 100"},{name:"KRX:KOSPI",displayName:"KOSPI"},{name:"TVC:NI225",displayName:"Nikkei 225"},{name:"TVC:SXXP",displayName:"STOXX 600"}]},{name:"원자재·환율",originalName:"Commodities & Forex",symbols:[{name:"OANDA:XAUUSD",displayName:"Gold"},{name:"COMEX:HG1!",displayName:"Copper"},{name:"NYMEX:CL1!",displayName:"WTI"},{name:"FX_IDC:USDKRW",displayName:"USD/KRW"}]}],showSymbolLogo:false,colorTheme:"dark",isTransparent:true,locale:"kr"});box.appendChild(s);
}
function init(){
 $("#asOf").textContent=new Date().toLocaleString("ko-KR",{dateStyle:"medium",timeStyle:"short"});
 renderAssets();renderPortfolio();renderQuotes();
 document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-page]");if(nav)showPage(nav.dataset.page);
  const go=e.target.closest("[data-go]");if(go)showPage(go.dataset.go);
  const asset=e.target.closest("[data-asset]");if(asset){const a=ASSETS.find(x=>x.id===asset.dataset.asset);if(a){loadChart(a);$("#chartPanel").scrollIntoView({behavior:"smooth",block:"start"})}}
  const w=e.target.closest("[data-watch]");if(w){const id=w.dataset.watch;watch=watch.includes(id)?watch.filter(x=>x!==id):[...watch,id];save();renderAssets();renderPortfolio();toast(watch.includes(id)?"관심자산에 추가했습니다.":"관심자산에서 제거했습니다.")}
  const del=e.target.closest("[data-delete]");if(del){positions.splice(Number(del.dataset.delete),1);save();renderPortfolio();toast("매입 기록을 삭제했습니다.")}
  const rg=e.target.closest("[data-interval]");if(rg){interval=rg.dataset.interval;$$("[data-interval]").forEach(b=>b.classList.toggle("selected",b===rg));if(selectedAsset)loadChart(selectedAsset)}
  const pt=e.target.closest("[data-product]");if(pt){productTab=pt.dataset.product;$$("[data-product]").forEach(b=>b.classList.toggle("selected",b===pt));$("#productContent").innerHTML=productTab==="fund"?'<div class="notice"><b>펀드 데이터 확인 필요</b><span>우리투자증권 공식 판매 상품 및 수익률 원천 데이터 연결 후 순위를 표시합니다.</span></div><div class="source-links"><a href="https://mweb.wooriib.com/fmm/FMM1010101/main.do?paramlikeRt=1" target="_blank" rel="noopener">우리투자증권 펀드 랭킹 ↗</a></div>':productTab==="etf"?'<div class="notice"><b>ETF 데이터 확인 필요</b><span>나무증권 거래 가능 여부와 ETF 수익률을 공식 데이터로 검증한 뒤 순위를 표시합니다.</span></div><div class="source-links"><a href="https://www.mynamuh.com/" target="_blank" rel="noopener">나무증권 ↗</a></div>':'<div class="notice"><b>추천 데이터 확인 필요</b><span>은행·증권사·운용사의 최신 추천 자료를 확인하고 추천 순위와 수익률 순위를 별도로 제공합니다.</span></div>'}
 });
 $("#assetSearch").addEventListener("input",renderAssets);$("#categoryFilter").addEventListener("change",renderAssets);
 $("#positionForm").addEventListener("submit",e=>{e.preventDefault();positions.unshift({asset:$("#positionAsset").value,price:Number($("#buyPrice").value),qty:Number($("#buyQty").value),date:$("#buyDate").value,memo:$("#buyMemo").value.trim()});save();renderPortfolio();e.target.reset();$("#buyDate").value=new Date().toISOString().slice(0,10);toast("매입 기록을 저장했습니다.")});
 $("#exportBtn").addEventListener("click",()=>{if(!positions.length){toast("내보낼 기록이 없습니다.");return}const rows=[["자산","티커","매입일","단가","수량","메모"],...positions.map(p=>{const a=ASSETS.find(x=>x.id===p.asset)||{};return[a.name,a.ticker,p.date,p.price,p.qty,p.memo]})];const csv="\uFEFF"+rows.map(r=>r.map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(",")).join("\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="asset-radar-positions.csv";a.click();URL.revokeObjectURL(url)});
 $("#refreshBtn").addEventListener("click",()=>{renderQuotes();$("#asOf").textContent=new Date().toLocaleString("ko-KR",{dateStyle:"medium",timeStyle:"short"});toast("시세 위젯을 다시 불러옵니다.")});
 $("#buyDate").value=new Date().toISOString().slice(0,10);
 if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
document.addEventListener("DOMContentLoaded",init);

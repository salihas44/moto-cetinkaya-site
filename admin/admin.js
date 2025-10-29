/* Admin JS (static JSON CMS) */
const App = (() => {
  const el=(t,a={},...c)=>{const n=document.createElement(t);Object.entries(a).forEach(([k,v])=>{if(k==="class")n.className=v;else if(k.startsWith("on")&&typeof v==="function")n.addEventListener(k.substring(2).toLowerCase(),v);else if(k==="html")n.innerHTML=v;else n.setAttribute(k,v)});c.forEach(m=>{if(m==null)return;if(typeof m==="string")n.appendChild(document.createTextNode(m));else n.appendChild(m)});return n};
  const sha256=async s=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,"0")).join("");
  const state={config:null,products:[],selected:null,dirty:false,filter:""};
  const $root=document.getElementById("app");
  const loadConfig=async()=>{const r=await fetch("./admin-config.json?ts="+Date.now()); if(!r.ok) throw new Error("admin-config.json yüklenemedi"); state.config=await r.json();};
  const loadProducts=async()=>{const r=await fetch(state.config.dataFile+"?ts="+Date.now()); if(!r.ok) throw new Error("products.json yüklenemedi"); state.products=await r.json();};
  const saveToFile=(obj,filename)=>{const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();};
  const LoginView=()=>el("div",{class:"login card container"},
    el("h1",{},"Yönetici Girişi"),
    el("p",{class:"small"},"Varsayılan şifre: ",el("span",{class:"kbd"},"admin123")," (giriş sonrası değiştirin)"),
    el("div",{class:"grid content"}, el("div",{}, el("label",{},"Şifre"), el("input",{type:"password",class:"input",id:"pw",placeholder:"Şifrenizi girin"}),
      el("div",{class:"right",style:"margin-top:12px"}, el("button",{class:"btn btn-primary",onclick:async()=>{const pw=document.getElementById("pw").value; const h=await sha256(pw); if(h===state.config.passwordHash){sessionStorage.setItem("mc_admin","ok"); render();} else alert("Hatalı şifre!");}},"Giriş Yap")))),
    el("p",{class:"small"},"Not: Statik barındırmada dosya yazımı yoktur. JSON'u dışa aktarın ve barındırmanıza yükleyin.")
  );
  const ProductRow=p=>el("tr",{},
    el("td",{},String(p.id)), el("td",{},p.sku||"-"), el("td",{},p.title||"-"),
    el("td",{},(p.price??"-")+" "+(p.currency||"")), el("td",{},p.category||"-"),
    el("td",{},String(p.stock??0)), el("td",{},p.active?"Açık":"Kapalı"),
    el("td",{}, el("div",{class:"flex"},
      el("button",{class:"btn",onclick:()=>{state.selected={...p}; render();}},"Düzenle"),
      el("button",{class:"btn btn-danger",onclick:()=>{ if(confirm("Silinsin mi?")){ state.products=state.products.filter(x=>x.id!==p.id); state.dirty=true; render(); }}},"Sil")
    ))
  );
  const ProductForm=()=>{const p=state.selected||{}; const set=(k,v)=>{state.selected={...p,[k]:v}; state.dirty=true; render();};
    return el("div",{class:"card"},
      el("div",{class:"header"}, el("h1",{},p.id?"Ürün Düzenle #"+p.id:"Yeni Ürün"),
        el("div",{class:"tools"}, el("button",{class:"btn",onclick:()=>{state.selected=null; render();}},"Vazgeç"),
          el("button",{class:"btn btn-ok",onclick:()=>{ if(!p.title) return alert("Başlık zorunlu");
            if(!p.id){ const maxId=state.products.reduce((m,x)=>Math.max(m,x.id||0),0); p.id=maxId+1; state.products.push(p); }
            else { const ix=state.products.findIndex(x=>x.id===p.id); if(ix>=0) state.products[ix]=p; }
            state.selected=null; state.dirty=true; render();
          }},"Kaydet")
        )
      ),
      el("div",{class:"content grid"},
        el("div",{}, el("label",{},"Başlık"), el("input",{class:"input",value:p.title||"",oninput:e=>set("title",e.target.value)}),
          el("div",{style:"height:10px"}), el("label",{},"Açıklama"), el("textarea",{class:"textarea",oninput:e=>set("description",e.target.value)},p.description||""),
          el("div",{style:"height:10px"}), el("label",{},"Kategori"), el("input",{class:"input",value:p.category||"",oninput:e=>set("category",e.target.value)}),
          el("div",{style:"height:10px"}), el("label",{},"SKU"), el("input",{class:"input",value:p.sku||"",oninput:e=>set("sku",e.target.value)}),
          el("div",{class:"flex",style:"gap:12px;margin-top:10px"},
            el("div",{style:"flex:1"}, el("label",{},"Fiyat"), el("input",{class:"input",type:"number",step:"0.01",value:p.price??"",oninput:e=>set("price",parseFloat(e.target.value))})),
            el("div",{style:"width:120px"}, el("label",{},"Para Birimi"), el("input",{class:"input",value:p.currency||"TRY",oninput:e=>set("currency",e.target.value)})),
            el("div",{style:"width:120px"}, el("label",{},"Stok"), el("input",{class:"input",type:"number",value:p.stock??0,oninput:e=>set("stock",parseInt(e.target.value||"0",10))}))
          ),
          el("div",{style:"height:10px"}),
          el("label",{class:"switch"}, el("input",{type:"checkbox",checked:!!p.active,onchange:e=>set("active",e.target.checked)}), " Listede görünsün (aktif)")
        ),
        el("div",{}, el("label",{},"Ürün Görseli (URL)"), el("input",{class:"input",value:p.image||"",oninput:e=>set("image",e.target.value)}),
          el("div",{class:"img-preview",style:"margin-top:8px"}, p.image?el("img",{src:p.image,alt:"Önizleme"}):el("span",{class:"small"},"Görsel URL girin"))
        )
      )
    );};
  const Dashboard=()=>{
    const list=state.products.filter(p=>{const q=state.filter.trim().toLowerCase(); if(!q) return true; return [p.title,p.sku,p.category].some(x=>(x||"").toLowerCase().includes(q));}).sort((a,b)=>(b.id||0)-(a.id||0));
    return el("div",{class:"container card"},
      el("div",{class:"header"}, el("h1",{},"Ürün Yönetimi"),
        el("div",{class:"tools"},
          el("input",{class:"input",placeholder:"Ara (başlık, SKU, kategori)...",oninput:e=>{state.filter=e.target.value; render();}}),
          el("button",{class:"btn",onclick:()=>{state.selected={active:true,currency:'TRY'}; render();}},"Yeni Ürün"),
          el("label",{class:"btn"},"İçe Aktar JSON", el("input",{type:"file",accept:"application/json",style:"display:none",onchange:async e=>{const file=e.target.files[0]; if(!file) return; const text=await file.text(); try{const arr=JSON.parse(text); if(!Array.isArray(arr)) throw new Error("Geçersiz JSON"); state.products=arr; state.dirty=true; render();}catch(err){alert("İçe aktarılamadı: "+err.message);}}})),
          el("button",{class:"btn btn-ok",onclick:()=>saveToFile(state.products,"products.json")},"Dışa Aktar"),el("button",{class:"btn btn-primary",onclick:()=>publishLive(state.products)},"Yayınla (Canlı Kaydet)"),
          el("button",{class:"btn",onclick:async()=>{const newPw=prompt("Yeni şifre girin (en az 6 karakter):"); if(!newPw||newPw.length<6) return; const h=await sha256(newPw); state.config.passwordHash=h; const blob=new Blob([JSON.stringify(state.config,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="admin-config.json"; document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove(); alert("Güncel admin-config.json indirildi. Barındırmanıza yükleyin.");}},"Şifreyi Değiştir")
        )
      ),
      el("div",{class:"content"}, state.selected?ProductForm():el("div",{},
        el("table",{class:"table"}, el("thead",{}, el("tr",{}, el("th",{},"ID"), el("th",{},"SKU"), el("th",{},"Başlık"), el("th",{},"Fiyat"), el("th",{},"Kategori"), el("th",{},"Stok"), el("th",{},"Durum"), el("th",{},"İşlem"))),
          el("tbody",{}, ...list.map(ProductRow))
        ),
        state.dirty?el("div",{class:"small",style:"margin-top:8px"},"Kaydetmeyi unutmayın: ",el("span",{class:"kbd"},"Dışa Aktar")," ile ",el("span",{class:"kbd"},"products.json")," dosyasını indirip barındırmanıza yükleyin."):null
      )),
      el("footer",{},"Statik Admin • Sunucu tarafı otomatik kayıt için API/Functions ekleyin veya Decap (Netlify) CMS kullanın.")
    );
  };
  const render=()=>{const logged=sessionStorage.getItem("mc_admin")==="ok"; $root.innerHTML=""; if(!logged){$root.appendChild(LoginView()); return;} if(!state._loaded){loadProducts().then(()=>{state._loaded=true; render();}).catch(err=>{$root.appendChild(el("div",{class:"container card content"}, el("p",{},"Hata: "+err.message)));}); return;} $root.appendChild(Dashboard());};
  (async function init(){ try{ await loadConfig(); render(); } catch(err){ $root.innerHTML="<div class='container card content'><p>Yükleme hatası: "+err.message+"</p></div>"; } })();
})();

// === Live Publish Helper ===
async function publishLive(products) {
  try {
    const token = prompt("Yayınlama token’ını girin (Netlify ADMIN_TOKEN):");
    if (!token) return;
    const res = await fetch("/.netlify/functions/save-products", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify(products)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
      alert("Yayınlanamadı: " + (data.error || res.statusText));
      return;
    }
    alert("Başarılı: Ürünler canlı olarak güncellendi!");
  } catch (e) {
    alert("Hata: " + e.message);
  }
}

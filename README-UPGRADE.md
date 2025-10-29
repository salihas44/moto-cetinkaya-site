# Upgrade v2 — Tam Panel Entegrasyonu
Bu paketle:
- `data/site.json` → Site genel ayarları (başlık, logo, hero, adres, telefon, WhatsApp, Instagram, footer)
- `admin/panel-v2.html` → Yeni yönetim paneli (Genel Ayarlar + Ürünler)
- `netlify/functions/get-settings.js` & `save-settings.js` → Ayarları okuma/yazma

## Kurulum
1. Bu klasörün içindekileri GitHub reponuzun **aynı yollarına** yükleyin.
2. Netlify → Site settings → Environment variables → `ADMIN_TOKEN` değerini girin.
3. Netlify → Deploys → Trigger deploy → Clear cache and deploy.
4. Paneli açın: `/admin/panel-v2.html` — token alanına ADMIN_TOKEN yazın.

## Index.html'e bağlama
`index.html` dosyanıza şu script'i ekleyin (body sonuna yakın):
```html
<script>
fetch('/data/site.json').then(r=>r.json()).then(s=>{
  (document.querySelector('[data-bind="siteTitle"]')||{}).textContent = s.siteTitle||'';
  const el = (x)=>document.querySelector(x);
  if(el('#heroTitle')) el('#heroTitle').textContent = s.heroTitle||'';
  if(el('#heroSubtitle')) el('#heroSubtitle').textContent = s.heroSubtitle||'';
  if(el('#addr')) el('#addr').textContent = s.address||'';
  if(el('#phone')) el('#phone').textContent = s.phone||'';
  if(el('#wa')){ el('#wa').href = 'https://wa.me/'+(s.whatsapp||'').replace(/\D/g,''); }
  if(el('#logo')) el('#logo').src = s.logoUrl||'';
  if(el('#popularTitle')) el('#popularTitle').textContent = s.popularTitle||'';
  if(el('#footerNote')) el('#footerNote').textContent = s.footerNote||'';
});
</script>
```
HTML'inde uygun elementlere id veya data-bind ekle: `id="heroTitle"`, `id="addr"`, `id="phone"`, `id="popularTitle"`, `id="footerNote"`, logo için `id="logo"` vb.

## Notlar
- Ürünler mevcut `get-products`/`save-products` fonksiyonlarıyla çalışmaya devam eder.
- Yeni panel sayfası: `/admin/panel-v2.html`

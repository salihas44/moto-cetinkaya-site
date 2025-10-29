
const phone = '+905517230149'; // WhatsApp
const products = [
  {id:'p1', name:'Supersport 1000', price: 389000, img:'assets/img/prod1.jpg', specs:['999cc','ABS','Quickshifter']},
  {id:'p2', name:'Off-Road 250', price: 129000, img:'assets/img/prod2.jpg', specs:['250cc','Off-road lastik','Yüksek süspansiyon']},
  {id:'p3', name:'Sport 300', price: 169000, img:'assets/img/prod3.jpg', specs:['300cc','LED far','Sport tasarım']},
  {id:'p4', name:'Maxi Scooter 400', price: 219000, img:'assets/img/prod4.jpg', specs:['400cc','Büyük sele','CVT']},
  {id:'p5', name:'SuperSport 660', price: 279000, img:'assets/img/prod5.jpg', specs:['660cc','Çift disk','Ride-by-wire']},
  {id:'p6', name:'Street 200', price: 119000, img:'assets/img/prod6.jpg', specs:['200cc','Ekonomik','Günlük kullanım']},
];

const cart = {};

function formatTRY(n){ return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(n); }

function toggleMenu(){ document.querySelector('.menu').classList.toggle('open'); }

function renderProducts(){
  const wrap = document.getElementById('productWrap');
  wrap.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}" data-id="${p.id}" class="click-detail" />
      <div class="p-body">
        <div style="font-weight:800">${p.name}</div>
        <div class="price">${formatTRY(p.price)}</div>
        <div class="qty">
          <label>Adet</label>
          <input type="number" min="1" value="1" id="qty-${p.id}" />
        </div>
        <div class="actions">
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Sepete Ekle</button>
          <button class="btn" onclick="openDetail('${p.id}')">İncele</button>
        </div>
      </div>
    `;
    wrap.appendChild(el);
  });
  // add click to image to open detail & enlarge
  document.querySelectorAll('.click-detail').forEach(img => {
    img.addEventListener('click', () => openDetail(img.dataset.id));
  });
}

function addToCart(id){
  const qty = Math.max(1, parseInt(document.getElementById('qty-'+id).value||'1'));
  cart[id] = (cart[id]||0) + qty;
  updateCartBadge();
  alert('Ürün sepete eklendi ✅');
}

function updateCartBadge(){
  const total = Object.values(cart).reduce((a,b)=>a+b,0);
  document.getElementById('cartBadge').textContent = total;
}

function openModal(id){
  document.getElementById(id).classList.add('open');
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
}

function openDetail(id){
  const p = products.find(x=>x.id===id);
  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="detail-layout">
      <img src="${p.img}" alt="${p.name}" />
      <div>
        <h3 style="margin:0 0 6px 0">${p.name}</h3>
        <div class="price" style="font-size:22px">${formatTRY(p.price)}</div>
        <ul style="margin:8px 0 12px 18px">${p.specs.map(s=>`<li>${s}</li>`).join('')}</ul>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Sepete Ekle</button>
          <a class="btn" href="https://wa.me/${phone}?text=${encodeURIComponent('Merhaba, '+p.name+' hakkında bilgi almak istiyorum.')}"
             target="_blank">WhatsApp Sor</a>
        </div>
      </div>
    </div>
  `;
  openModal('detailModal');
}

function openCart(){
  const rows = Object.entries(cart).map(([id,qty])=>{
    const p = products.find(x=>x.id===id);
    return `<tr><td>${p.name}</td><td>${qty}</td><td>${formatTRY(p.price*qty)}</td></tr>`
  }).join('');
  const total = Object.entries(cart).reduce((sum,[id,qty])=>{
    const p = products.find(x=>x.id===id);
    return sum + p.price*qty;
  },0);
  document.getElementById('cartBody').innerHTML = `
    <div class="cart-summary">
      <table class="table">
        <thead><tr><th>Ürün</th><th>Adet</th><th>Tutar</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="3">Sepetiniz boş.</td></tr>'}</tbody>
        <tfoot><tr><th colspan="2" style="text-align:right">Toplam</th><th>${formatTRY(total)}</th></tr></tfoot>
      </table>
      <div class="form-actions">
        <a class="btn btn-primary" href="payment.html" target="_blank">Kredi Kartı ile Öde</a>
        <a class="btn" target="_blank" href="${waCheckoutLink()}">WhatsApp ile Sipariş Ver</a>
      </div>
    </div>
  `;
  openModal('cartModal');
}

function waCheckoutLink(){
  const items = Object.entries(cart).map(([id,qty])=>{
    const p = products.find(x=>x.id===id);
    return `${qty} x ${p.name} (${formatTRY(p.price)})`;
  }).join('%0A');
  const msg = `Merhaba, aşağıdaki ürünleri satın almak istiyorum:%0A${items}%0ATeşekkürler.`;
  return `https://wa.me/${phone}?text=${msg}`;
}

// Service appointment form -> WhatsApp
function submitService(e){
  e.preventDefault();
  const form = e.target;
  const data = {
    ad: form.ad.value.trim(),
    tel: form.tel.value.trim(),
    tarih: form.tarih.value,
    saat: form.saat.value,
    model: form.model.value.trim(),
    not: form.not.value.trim()
  };
  const msg = `Servis Randevu Talebi:%0AAd: ${data.ad}%0ATel: ${data.tel}%0ATarih: ${data.tarih}%0ASaat: ${data.saat}%0AModel: ${data.model}%0ANot: ${data.not}`;
  const link = `https://wa.me/${phone}?text=${msg}`;
  window.open(link,'_blank');
  closeModal('serviceModal');
}

document.addEventListener('DOMContentLoaded',()=>{
  renderProducts();
  document.getElementById('burger').addEventListener('click', toggleMenu);
  document.getElementById('openCart').addEventListener('click', openCart);
  document.getElementById('serviceForm').addEventListener('submit', submitService);
});

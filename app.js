document.addEventListener('DOMContentLoaded',()=>{
 const cards=document.querySelector('#cards'), search=document.querySelector('#projectSearch'), bhk=document.querySelector('#bhkFilter'), compare=document.querySelector('#compareContent');
 const selected=new Set();
 const readProjects=()=>Array.from(document.querySelectorAll('#cards .card')).map((el,i)=>({el,name:el.querySelector('h3')?.textContent||'',text:el.innerText,price:el.querySelector('.price')?.textContent||'Not verified',config:el.querySelector('.cb p')?.textContent||'Not verified'}));
 function filter(){const q=(search?.value||'').toLowerCase(),b=bhk?.value||'';readProjects().forEach(p=>{const hit=p.text.toLowerCase().includes(q)&&(!b||new RegExp('\\b'+b+'\\s*bhk','i').test(p.text));p.el.style.display=hit?'':'none';});}
 search?.addEventListener('input',filter);bhk?.addEventListener('change',filter);
 document.querySelectorAll('#cards .card').forEach(card=>{
  const name=card.querySelector('h3')?.textContent||'';
  const actions=card.querySelector('.cb');
  if(actions&&!actions.querySelector('[data-compare]')){
   const btn=document.createElement('button');btn.className='btn';btn.textContent='Compare';btn.dataset.compare='1';btn.style.marginLeft='6px';
   btn.addEventListener('click',()=>{if(selected.has(name)){selected.delete(name);btn.textContent='Compare';}else if(selected.size<3){selected.add(name);btn.textContent='Added ✓';}else{alert('Compare up to three projects at a time.');}renderCompare();});
   actions.appendChild(btn);
  }
 });
 function renderCompare(){const rows=readProjects().filter(p=>selected.has(p.name));if(!rows.length){compare.textContent='Choose Compare on a project card to begin.';return;}
 const table=document.createElement('table');table.className='compare-table';table.innerHTML='<tr><th>Project</th><th>Configuration / location</th><th>Indicative price</th><th>Verification</th></tr>';
 rows.forEach(p=>{const tr=document.createElement('tr');[p.name,p.config,p.price,'Unverified'].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td);});table.appendChild(tr);});
 compare.replaceChildren(table);
 }
 const inputs=['loan','rate','years'];function calc(){const principal=Math.max(0,Number(document.querySelector('#loan')?.value||0)-Number(document.querySelector('#down')?.value||0)),r=Number(document.querySelector('#rate')?.value||0)/1200,n=Number(document.querySelector('#years')?.value||0)*12;const emi=r&&n?principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):(n?principal/n:0);const out=document.querySelector('#emi');if(out)out.textContent=emi?emi.toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}):'₹0';}
 [...inputs,'down'].forEach(id=>document.querySelector('#'+id)?.addEventListener('input',calc));calc();
 document.querySelector('#adminPreview')?.addEventListener('click',()=>alert('Admin preview only. Secure login, shared database, edit permissions and audit history are not configured yet.'));
 const chatToggle=document.querySelector('#chatToggle');if(chatToggle){chatToggle.addEventListener('click',()=>{let box=document.querySelector('#chatPanel');if(!box){box=document.createElement('div');box.id='chatPanel';box.className='contact';box.style.cssText='position:fixed;right:18px;bottom:76px;width:min(340px,calc(100vw - 36px));z-index:20;box-shadow:0 15px 50px #0003;background:white';box.innerHTML='<b>VKS Property Assistant · Preview</b><p class="note">I can answer basic questions using the current project catalogue. I am not connected to a live AI model yet.</p><div id="chatReply" class="muted" style="font-size:13px;margin:12px 0">Ask about project types, comparisons, prices or EMI.</div><input id="chatAsk" placeholder="Ask about projects…" style="width:100%;padding:11px;border:1px solid #ddd"><button id="chatSend" class="btn" style="margin-top:8px">Ask</button>';document.body.appendChild(box);document.querySelector('#chatSend').onclick=()=>{const q=document.querySelector('#chatAsk').value.toLowerCase();let answer='I can help compare the six listed projects. Please select a project card or contact VKS Realty to verify live details.';if(q.includes('price')||q.includes('cost'))answer='The website currently displays indicative reference prices only. Please confirm the latest price and inventory directly with VKS Realty.';else if(q.includes('3d')||q.includes('ar')||q.includes('vr'))answer='The current 3D viewer is a generic concept placeholder. Project-specific AR/VR experiences require approved models and 360° assets.';else if(q.includes('progress')||q.includes('complete'))answer='Construction stages are shown as an illustrative workflow. No project completion status has been verified yet.';else if(q.includes('emi')||q.includes('loan'))answer='Use the Home Loan EMI calculator on this page to estimate monthly repayments.';document.querySelector('#chatReply').textContent=answer;};}else box.remove();});}
});

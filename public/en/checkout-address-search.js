(() => {
  window.OGSAddressSearch = {setup(form) {
    const box = form.querySelector('#address-search');
    if (!box) return;
    const input = box.querySelector('input'), results = box.querySelector('ul');
    const status = box.querySelector('[role="status"]'), attribution = box.querySelector('#address-search-attribution');
    let session = crypto.randomUUID(), revision = 0, timer, controller, applying = false;
    const clear = () => { results.replaceChildren(); results.hidden = true; attribution.hidden = true; };
    function cancel() { revision++; clearTimeout(timer); controller?.abort(); clear(); status.textContent = ''; }
    async function request(body, signal) {
      const response = await fetch('/api/address-search/places', {method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,sessionToken:session}),signal});
      if(!response.ok) throw new Error('unavailable');
      return response.json();
    }
    async function choose(placeId) {
      cancel(); const current = revision; controller = new AbortController();
      status.textContent = 'Loading address…'; attribution.hidden = false;
      try {
        const data = await request({placeId},controller.signal);
        if(current !== revision) return;
        const a=data.address, city=form.elements.city, district=form.elements.district;
        if(!a || !Array.from(city.options).some(o=>o.value===a.city)) throw new Error('range');
        // Snapshot first so a rejected result never leaves a partially changed address.
        const previous = {city:city.value,district:district.value};
        applying = true;
        city.value=a.city;city.dispatchEvent(new Event('change',{bubbles:true}));
        if(!Array.from(district.options).some(o=>o.value===a.district)) {
          city.value=previous.city;city.dispatchEvent(new Event('change',{bubbles:true}));
          district.value=previous.district;district.dispatchEvent(new Event('change',{bubbles:true}));
          throw new Error('range');
        }
        district.value=a.district;district.dispatchEvent(new Event('change',{bubbles:true}));
        form.elements.street.value=a.street; // Floor/unit is buyer-owned and never overwritten.
        input.value=data.formattedAddress || a.city+a.district+a.street;
        status.textContent='Address added. Check the house number and add a floor or unit if needed.';
        session=crypto.randomUUID();
      } catch(error) {
        if(current===revision && error.name!=='AbortError') {
          clear();status.textContent=error.message==='range'?'This address is outside the current delivery area. Please fill in the fields below.':'Address search is unavailable. Please fill in the fields below.';
        }
      } finally {applying=false;}
    }
    input.addEventListener('input', () => {
      cancel(); const query=input.value.trim(), current=revision;
      if(query.length<3) return;
      timer=setTimeout(async()=> {
        controller=new AbortController(); status.textContent='Searching for addresses…';
        try {
          const data=await request({input:query},controller.signal);
          if(current!==revision) return;
          clear();const suggestions=Array.isArray(data.suggestions)?data.suggestions:[];
          for(const s of suggestions) {
            const li=document.createElement('li'), button=document.createElement('button');
            button.type='button';button.textContent=s.text;button.addEventListener('click',()=>choose(s.placeId));li.append(button);results.append(li);
          }
          results.hidden=!suggestions.length;attribution.hidden=!suggestions.length;
          status.textContent=suggestions.length?'':'No addresses found. Try more detail or fill in the fields below.';
        } catch(error) {if(current===revision && error.name!=='AbortError') {clear();status.textContent='Address search is unavailable. Please fill in the fields below.';}}
      },450);
    });
    input.addEventListener('keydown', event=> {if(event.key==='Enter'){event.preventDefault();results.querySelector('button')?.focus();}if(event.key==='Escape')cancel();});
    for(const name of ['city','district','street','unit']) {
      for(const event of ['input','change']) form.elements[name].addEventListener(event,()=>{if(!applying) cancel();});
    }
    fetch('/api/address-search/config').then(r=>r.ok?r.json():null).then(data=>{box.hidden=!data?.enabled;}).catch(()=>{});
  }};
})();

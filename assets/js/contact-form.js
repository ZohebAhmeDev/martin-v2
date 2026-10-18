(()=>{var b=(t,e)=>()=>{try{return e||t((e={exports:{}}).exports,e),e.exports}catch(r){throw e=0,r}};var f=b(()=>{document.addEventListener("DOMContentLoaded",()=>{let t=document.getElementById("quoteForm");if(!t)return;let e=document.getElementById("formStatus"),r=t.querySelector('button[type="submit"]');t.addEventListener("submit",async c=>{c.preventDefault();let l=t.querySelector('input[name="website"]');if(l&&l.value.trim()!==""){e&&(e.innerHTML='<div class="p-4 bg-green-900/60 border border-green-500 text-white font-medium">Thank you! Your message has been sent successfully.</div>',e.classList.remove("hidden")),t.reset();return}let i=t.querySelector('[name="name"]')?.value.trim(),s=t.querySelector('[name="phone"]')?.value.trim(),d=t.querySelector('[name="email"]')?.value.trim(),a=t.querySelector('[name="product"]')?.value||"General Inquiry",m=t.querySelector('[name="message"]')?.value.trim();if(!i||!s||!d){e&&(e.innerHTML='<div class="p-4 bg-red-900/80 border border-red-500 text-white font-medium">Please fill in all required fields (Name, Phone, Email).</div>',e.classList.remove("hidden"));return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d)){e&&(e.innerHTML='<div class="p-4 bg-red-900/80 border border-red-500 text-white font-medium">Please enter a valid email address.</div>',e.classList.remove("hidden"));return}let u=new FormData(t);window.dataLayer&&window.dataLayer.push({event:"form_submit_attempt",product_interest:a});let h=r.innerHTML;r.disabled=!0,r.innerHTML='<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Sending inquiry...</span>';try{let n=await fetch("/send.php",{method:"POST",body:u}),o=await n.json().catch(()=>({success:n.ok}));if(n.ok&&o.success){window.dataLayer&&window.dataLayer.push({event:"form_submit_success",product_interest:a}),t.reset();let p=encodeURIComponent(`Hello Martin Engineering, I submitted a quote request for ${a}. My name is ${i}, phone ${s}.`);e&&(e.innerHTML=`
            <div class="p-5 bg-black border-2 border-brand text-white">
              <p class="text-lg font-bold text-white flex items-center gap-2">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Inquiry Received!
              </p>
              <p class="mt-2 text-sm text-white/80">Our engineering team will contact you shortly on ${s}.</p>
              <div class="mt-4">
                <a href="https://wa.me/919811535035?text=${p}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black transition">
                  Confirm via WhatsApp Instant Chat &rarr;
                </a>
              </div>
            </div>`,e.classList.remove("hidden"))}else throw new Error(o.error||"Server error")}catch(n){window.dataLayer&&window.dataLayer.push({event:"form_submit_error",error_message:n.message});let o=encodeURIComponent(`Hello Martin Engineering, I tried to send a quote request on your website for ${a}.
Name: ${i}
Phone: ${s}
Message: ${m||"Please send catalog and price"}`);e&&(e.innerHTML=`
          <div class="p-5 bg-black border border-white/20 text-white">
            <p class="text-brand font-bold">Thank you for reaching out.</p>
            <p class="mt-1 text-sm text-white/80">You can connect with our sales team immediately on WhatsApp or call:</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <a href="https://wa.me/919811535035?text=${o}" target="_blank" rel="noopener noreferrer" class="bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition">Chat on WhatsApp</a>
              <a href="tel:+919811535035" class="border border-white/60 px-5 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition">Call +91 98115 35035</a>
            </div>
          </div>`,e.classList.remove("hidden"))}finally{r.disabled=!1,r.innerHTML=h}})})});f();})();

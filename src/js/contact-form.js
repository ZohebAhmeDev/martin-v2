/**
 * Contact Form Controller with Honeypot, Validation, PHP Mailer integration,
 * and instant WhatsApp fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  const statusEl = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Honeypot check
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== '') {
      // Spam bot detected - fake success without sending
      if (statusEl) {
        statusEl.innerHTML = '<div class="p-4 bg-green-900/60 border border-green-500 text-white font-medium">Thank you! Your message has been sent successfully.</div>';
        statusEl.classList.remove('hidden');
      }
      form.reset();
      return;
    }

    // 2. Validate fields
    const name = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const product = form.querySelector('[name="product"]')?.value || 'General Inquiry';
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!name || !phone || !email) {
      if (statusEl) {
        statusEl.innerHTML = '<div class="p-4 bg-red-900/80 border border-red-500 text-white font-medium">Please fill in all required fields (Name, Phone, Email).</div>';
        statusEl.classList.remove('hidden');
      }
      return;
    }

    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (statusEl) {
        statusEl.innerHTML = '<div class="p-4 bg-red-900/80 border border-red-500 text-white font-medium">Please enter a valid email address.</div>';
        statusEl.classList.remove('hidden');
      }
      return;
    }

    // Prepare payload
    const formData = new FormData(form);

    // Track submission attempt
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submit_attempt',
        product_interest: product
      });
    }

    // UI loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Sending inquiry...</span>';

    try {
      const response = await fetch('/send.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json().catch(() => ({ success: response.ok }));

      if (response.ok && result.success) {
        // Track success
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'form_submit_success',
            product_interest: product
          });
        }

        form.reset();
        const waMsg = encodeURIComponent(`Hello Martin Engineering, I submitted a quote request for ${product}. My name is ${name}, phone ${phone}.`);
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="p-5 bg-black border-2 border-brand text-white">
              <p class="text-lg font-bold text-white flex items-center gap-2">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Inquiry Received!
              </p>
              <p class="mt-2 text-sm text-white/80">Our engineering team will contact you shortly on ${phone}.</p>
              <div class="mt-4">
                <a href="https://wa.me/919811535035?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-white hover:text-black transition">
                  Confirm via WhatsApp Instant Chat &rarr;
                </a>
              </div>
            </div>`;
          statusEl.classList.remove('hidden');
        }
      } else {
        throw new Error(result.error || 'Server error');
      }
    } catch (err) {
      // Telemetry error
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submit_error',
          error_message: err.message
        });
      }

      const waMsg = encodeURIComponent(`Hello Martin Engineering, I tried to send a quote request on your website for ${product}.\nName: ${name}\nPhone: ${phone}\nMessage: ${message || 'Please send catalog and price'}`);
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="p-5 bg-black border border-white/20 text-white">
            <p class="text-brand font-bold">Thank you for reaching out.</p>
            <p class="mt-1 text-sm text-white/80">You can connect with our sales team immediately on WhatsApp or call:</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <a href="https://wa.me/919811535035?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition">Chat on WhatsApp</a>
              <a href="tel:+919811535035" class="border border-white/60 px-5 py-2 text-sm font-bold text-white hover:bg-white hover:text-black transition">Call +91 98115 35035</a>
            </div>
          </div>`;
        statusEl.classList.remove('hidden');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});

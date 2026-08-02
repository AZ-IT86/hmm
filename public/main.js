// API Configuration
const API_URL = '/api';

// Load services dari backend
async function loadServices() {
    try {
        const res = await fetch(`${API_URL}/services`);
        const services = await res.json();
        const container = document.getElementById('services-list');
        const serviceSelect = document.getElementById('service');
        
        if(container) {
            container.innerHTML = services.map(svc => `
                <div class="service-card">
                    <div class="service-icon"><i class="${svc.icon}"></i></div>
                    <div class="service-content">
                        <h3>${svc.name}</h3>
                        <p>${svc.description}</p>
                        <div class="service-price">Rp ${svc.price.toLocaleString()} / sesi</div>
                        <a href="https://wa.me/6281326558865?text=Halo%20Kang%20Jay%2C%20saya%20tertarik%20dengan%20layanan%20${encodeURIComponent(svc.name)}" class="whatsapp-button-service" target="_blank">
                            <i class="fab fa-whatsapp"></i> Tanya Layanan Ini
                        </a>
                    </div>
                </div>
            `).join('');
        }
        
        if(serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Pilih Layanan</option>' + 
                services.map(svc => `<option value="${svc.name} - Rp ${svc.price.toLocaleString()}">${svc.name} - Rp ${svc.price.toLocaleString()}</option>`).join('');
        }
    } catch(e) { 
        console.log("Gagal load services", e); 
    }
}

// Handle booking form submission
document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value;
    
    if(!name || !phone || !service || !date || !time) {
        alert("Harap lengkapi data pemesanan");
        return;
    }
    
    // Simpan ke database backend
    try {
        const bookingData = { name, phone, service, date, time, message, status: 'pending' };
        await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
    } catch(err) { 
        console.warn("Gagal simpan ke DB, tetap lanjut WA"); 
    }
    
    // Kirim WA
    const formattedDate = new Date(date).toLocaleDateString('id-ID', { 
        weekday:'long', 
        day:'numeric', 
        month:'long', 
        year:'numeric' 
    });
    
    const waMessage = `Halo Kang Jay, saya ingin pesan:%0A*Nama:* ${name}%0A*Layanan:* ${service}%0A*Tanggal:* ${formattedDate}%0A*Waktu:* ${time}%0A*Catatan:* ${message || '-'}%0A%0A Mohon konfirmasi ketersediaan. Terima kasih.`;
    
    window.open(`https://wa.me/6281326558865?text=${waMessage}`, '_blank');
    alert("Pesanan terkirim! Anda akan diarahkan ke WhatsApp Kang Jay.");
    e.target.reset();
});

// Navigation active & smooth scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function setActiveNav() {
    let current = '';
    const scrollPos = window.scrollY + 120;
    
    sections.forEach(section => {
        if(scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href')?.substring(1);
        if(href === current) link.classList.add('active');
    });
}

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if(targetId && targetId !== '#') {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Mobile menu toggle
const menuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuDiv = document.getElementById('mobileMenu');

if(menuBtn) {
    menuBtn.onclick = () => mobileMenuDiv.classList.toggle('active');
}

document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuDiv.classList.remove('active');
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if(window.scrollY > 40) {
        header.style.padding = '8px 0';
    } else {
        header.style.padding = '12px 0';
    }
    setActiveNav();
});

// Initialize on page load
window.addEventListener('load', () => {
    setActiveNav();
    loadServices();
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if(dateInput) dateInput.min = today;
});
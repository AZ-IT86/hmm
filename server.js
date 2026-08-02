// server.js - Pure Node.js (Tanpa Admin, Hanya Halaman Utama)
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// ============ DATA HARDCORE ============
const SERVICES = [
    { id: 1, name: 'Pijat Relaksasi', description: 'Pijat untuk relaksasi tubuh dan menghilangkan stres', price: 100000, icon: 'fa-spa' },
    { id: 2, name: 'Pijat Refleksi', description: 'Pijat titik refleksi untuk kesehatan seluruh tubuh', price: 100000, icon: 'fa-shoe-prints' },
    { id: 3, name: 'Pijat Capek Vitalitas', description: 'Pijat untuk mengembalikan vitalitas dan energi', price: 150000, icon: 'fa-bolt' },
    { id: 4, name: 'Terapi Asam Lambung', description: 'Terapi untuk mengatasi masalah asam lambung', price: 100000, icon: 'fa-stomach' },
    { id: 5, name: 'Terapi Asam Urat', description: 'Terapi untuk mengatasi asam urat', price: 100000, icon: 'fa-bone' },
    { id: 6, name: 'Terapi Hipertensi', description: 'Terapi untuk membantu mengatasi hipertensi', price: 100000, icon: 'fa-heartbeat' },
    { id: 7, name: 'Terapi Syaraf Kejepit', description: 'Terapi untuk mengatasi syaraf kejepit', price: 100000, icon: 'fa-spine' },
    { id: 8, name: 'Terapi Strok Ringan', description: 'Terapi untuk pemulihan strok ringan', price: 100000, icon: 'fa-brain' }
];

let BOOKINGS = [];
let bookingIdCounter = 1;

// ============ MIME TYPES ============
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// ============ STATIC FILE HANDLER ============
function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// ============ CORS HEADERS ============
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ============ API HANDLERS ============

// GET /api/services
function handleGetServices(res) {
    setCorsHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SERVICES));
}

// POST /api/bookings
function handleCreateBooking(body, res) {
    setCorsHeaders(res);
    
    try {
        const { name, phone, service, date, time, message } = body;
        
        if (!name || !phone || !service || !date || !time) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Semua field harus diisi' }));
            return;
        }
        
        const newBooking = {
            id: bookingIdCounter++,
            name,
            phone,
            service,
            date,
            time,
            message: message || '',
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        BOOKINGS.push(newBooking);
        
        console.log(`✅ Booking baru: ${name} - ${service}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: newBooking.id }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

// ============ REQUEST HANDLER ============
function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    console.log(`${method} ${pathname}`);
    
    // OPTIONS (CORS Preflight)
    if (method === 'OPTIONS') {
        setCorsHeaders(res);
        res.writeHead(200);
        res.end();
        return;
    }
    
    // ===== API ROUTES =====
    
    // GET /api/services
    if (pathname === '/api/services' && method === 'GET') {
        handleGetServices(res);
        return;
    }
    
    // POST /api/bookings
    if (pathname === '/api/bookings' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                handleCreateBooking(data, res);
            } catch (error) {
                setCorsHeaders(res);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // ===== STATIC FILES =====
    let filePath = pathname === '/' ? '/index.html' : pathname;
    const publicPath = path.join(__dirname, 'public', filePath);
    
    fs.access(publicPath, fs.constants.F_OK, (err) => {
        if (!err) {
            serveStaticFile(publicPath, res);
            return;
        }
        
        // Coba cari di public tanpa path
        const altPath = path.join(__dirname, 'public', pathname);
        fs.access(altPath, fs.constants.F_OK, (err2) => {
            if (!err2) {
                serveStaticFile(altPath, res);
                return;
            }
            
            res.writeHead(404);
            res.end('404 - File not found');
        });
    });
}

// ============ CREATE SERVER ============
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Kang Jay Trafis');
    console.log('========================================');
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📋 Total Layanan: ${SERVICES.length}`);
    console.log(`💾 Data: Hardcoded (tidak bisa diubah)`);
    console.log('========================================');
});

module.exports = server;
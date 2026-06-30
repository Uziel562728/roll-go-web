'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WA_NUMBER = process.env.WHATSAPP_NUMBER || '541151816111';

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── Data ────────────────────────────────────────────────────
const BUSINESS = {
  nombre: 'Roll & Go',
  slogan: 'El sushi que va con vos',
  whatsapp: '1151816111',
  whatsappFull: WA_NUMBER,
  instagram: 'sushi.roll.go',
  direccion: 'Terrada 592',
  beneficios: [
    { id: 'kosher',   icono: '✡️',  titulo: 'Kosher',              descripcion: 'Todos nuestros rolls cuentan con certificación kosher.' },
    { id: 'vegano',   icono: '🌱',  titulo: 'Opciones veganas',    descripcion: 'Opciones 100% plant-based sin compromiso en el sabor.' },
    { id: 'fresco',   icono: '⚡',  titulo: 'Hecho en el momento', descripcion: 'Preparamos cada roll al instante para garantizar frescura máxima.' },
  ],
  pasos: [
    { numero: 1, titulo: 'Abrí',     icono: '📦', descripcion: 'Separá el tubo que contiene la salsa de soja del resto del envase.' },
    { numero: 2, titulo: 'Vertí',    icono: '🫙', descripcion: 'Vertí la cantidad necesaria de salsa de soja directamente sobre los rolls.' },
    { numero: 3, titulo: 'Empujá',   icono: '👆', descripcion: 'Colocá el bastón de salsa en el orificio inferior y empujá suavemente.' },
    { numero: 4, titulo: 'Disfrutá', icono: '🍣', descripcion: 'Comé el roll directamente desde el tubo. Sin platos, sin complicaciones.' },
  ],
};

const MENU = [
  {
    id: 'clasico-salmon-palta',
    nombre: 'Clásico Salmón Palta',
    descripcion: 'El roll que nunca falla: salmón fresco y cremosa palta en perfecta armonía.',
    categoria: 'clasico',
    imagen: '/images/Clásico Salmón Palta.png',
    imagenTubo: '/images/tubos fotos/clasico salmon palta tubo .png',
    tags: ['Salmón', 'Palta'],
    destacado: false,
    ingredientes: ['Salmón', 'Palta', 'arroz', 'alga']
  },
  {
    id: 'salmon-palta-philadelphia',
    nombre: 'Salmón Palta Philadelphia',
    descripcion: 'El clásico potenciado con la cremosidad inconfundible del queso Philadelphia.',
    categoria: 'clasico',
    imagen: '/images/Salmón Palta Philadelphia.png',
    imagenTubo: '/images/tubos fotos/Salmón Palta Philadelphia tubo .png',
    tags: ['Salmón', 'Palta', 'Philadelphia'],
    destacado: false,
    ingredientes: ['Salmón', 'Palta', 'Queso', 'arroz', 'alga']
  },
  {
    id: 'atun-mayo-spicy-verdeo',
    nombre: 'Atún Mayo Spicy Verdeo',
    descripcion: 'Atún, mayo picante y verdeo fresco. Para los que buscan el kick perfecto en cada bocado.',
    categoria: 'clasico',
    imagen: '/images/Atún Mayo Spicy Verdeo.png',
    imagenTubo: '/images/tubos fotos/Atún Mayo Spicy Verdeo tubo .png',
    tags: ['Atún', 'Mayo Spicy', 'Verdeo'],
    destacado: false,
    ingredientes: ['Atún', 'Mayonesa', 'Verdeo', 'arroz', 'alga']
  },
  {
    id: 'veggie-rucula-champi-tomate-seco',
    nombre: 'Veggie Rúcula Champiñón Tomate Seco',
    descripcion: 'Rúcula fresca, champiñón salteado y tomate seco. Una opción plant-based irresistible.',
    categoria: 'veggie',
    imagen: '/images/Veggie Rúcula Champiñón Tomate Seco.png',
    imagenTubo: '/images/tubos fotos/Veggie Rúcula Champiñón Tomate Seco tubo .png',
    tags: ['Rúcula', 'Champiñón', 'Tomate Seco'],
    destacado: false,
    ingredientes: ['Rúcula', 'Champiñón', 'Tomate Seco', 'arroz', 'alga']
  },
  {
    id: 'panizado-salmon-palta',
    nombre: 'Panizado Salmón Palta',
    descripcion: 'Salmón y palta cubiertos con panko crocante japonés. El contraste de texturas perfecto.',
    categoria: 'panizado',
    imagen: '/images/Panizado Salmón Palta.png',
    imagenTubo: '/images/tubos fotos/Panizado Salmón Palta tubo .png',
    tags: ['Salmón', 'Palta', 'Panko'],
    destacado: false,
    ingredientes: ['Salmón', 'Palta', 'Panko', 'arroz', 'alga']
  },
  {
    id: 'panizado-salmon-palta-philadelphia',
    nombre: 'Panizado Salmón Palta Philadelphia',
    descripcion: 'El favorito de la casa: salmón, palta y Philadelphia todo envuelto en un panko dorado irresistible.',
    categoria: 'panizado',
    imagen: '/images/Panizado Salmón Palta Philadelphia.png',
    imagenTubo: '/images/tubos fotos/Panizado Salmón Palta Philadelphia tubo .png',
    tags: ['Salmón', 'Palta', 'Philadelphia', 'Panko'],
    destacado: true,
    ingredientes: ['Salmón', 'Palta', 'Queso', 'Panko', 'arroz', 'alga']
  },
];

// ── Helpers ─────────────────────────────────────────────────
function validate(fields, body) {
  const missing = fields.filter(f => !body[f] || (typeof body[f] === 'string' && !body[f].trim()));
  return missing;
}

// ── Routes ──────────────────────────────────────────────────

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'Roll & Go API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// GET /api/business
app.get('/api/business', (_req, res) => {
  res.json({ success: true, business: BUSINESS });
});

// GET /api/menu
app.get('/api/menu', (req, res) => {
  const { categoria } = req.query;
  let products = MENU;
  if (categoria && categoria !== 'all') {
    products = MENU.filter(p => p.categoria === categoria);
  }
  res.json({ success: true, total: products.length, products });
});

// GET /api/products/ & GET /api/products (supports query ?id=...)
app.get('/api/products', (req, res) => {
  const id = req.query.id || req.query.productId;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Debe proporcionar un ID de producto en la query (?id=...).' });
  }
  const product = MENU.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
  }
  res.json({ success: true, product });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = MENU.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
  }
  res.json({ success: true, product });
});

// POST /api/order
app.post('/api/order', (req, res) => {
  const { nombre, telefono, productos, cantidades, notas, direccion } = req.body;

  const missing = validate(['nombre', 'telefono'], req.body);
  if (missing.length) {
    return res.status(400).json({ success: false, error: `Campos requeridos: ${missing.join(', ')}` });
  }
  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ success: false, error: 'Debe incluir al menos un producto.' });
  }

  const lines = [
    '🍣 *Nuevo Pedido — Roll & Go*',
    '',
    `👤 *Nombre:* ${nombre.trim()}`,
    `📞 *Teléfono:* ${telefono.trim()}`,
    '',
    '*Productos:*',
    ...productos.map((p, i) => {
      const qty = (cantidades && cantidades[i]) ? cantidades[i] : 1;
      return `  • ${p} ×${qty} (Tubo de 10 u.)`;
    }),
  ];
  if (notas?.trim()) lines.push('', `📝 *Notas:* ${notas.trim()}`);
  if (direccion?.trim()) lines.push(`📍 *Dirección:* ${direccion.trim()}`);

  const message = lines.join('\n');
  const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  res.json({ success: true, whatsappUrl, message });
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
  const { nombre, telefono, mensaje } = req.body;

  const missing = validate(['nombre', 'telefono', 'mensaje'], req.body);
  if (missing.length) {
    return res.status(400).json({ success: false, error: `Campos requeridos: ${missing.join(', ')}` });
  }

  const lines = [
    '💬 *Consulta — Roll & Go*',
    '',
    `👤 *Nombre:* ${nombre.trim()}`,
    `📞 *Teléfono:* ${telefono.trim()}`,
    `📝 *Mensaje:* ${mensaje.trim()}`,
  ];

  const text = lines.join('\n');
  const whatsappUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  res.json({ success: true, whatsappUrl, message: 'Consulta recibida.' });
});

// GET /producto/:id -> Render details page
app.get('/producto/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.html'));
});

// SPA fallback — serve index.html for any unknown route
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍣  Roll & Go API running`);
  console.log(`    Local:   http://localhost:${PORT}`);
  console.log(`    Health:  http://localhost:${PORT}/api/health`);
  console.log(`    Menu:    http://localhost:${PORT}/api/menu\n`);
});

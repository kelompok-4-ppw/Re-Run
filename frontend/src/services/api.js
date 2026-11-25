const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const MOCK_PRODUCTS = [
  {
    id: 1, name: 'Classic Navy Oxford Shirt', slug: 'classic-navy-oxford-shirt', category: 'Tops',
    price: 249000, badge: 'new', condition: 'Brand New with Tag',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    variants: [{ size: 'S', stock: 5 }, { size: 'M', stock: 8 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 3 }]
  },
  {
    id: 2, name: 'Structured Tailored Blazer', slug: 'structured-tailored-blazer', category: 'Outerwear',
    price: 485000, badge: 'pre_loved', condition: 'Like New (9.5/10)',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    variants: [{ size: 'M', stock: 2 }, { size: 'L', stock: 1 }]
  },
  {
    id: 3, name: 'Pleated Wide-Leg Trousers', slug: 'pleated-wide-leg-trousers', category: 'Pants',
    price: 329000, badge: 'limited', condition: 'Curated Archive',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80',
    variants: [{ size: 'S', stock: 4 }, { size: 'M', stock: 6 }, { size: 'L', stock: 2 }]
  },
  {
    id: 4, name: 'Minimalist Knit Cardigan', slug: 'minimalist-knit-cardigan', category: 'Tops',
    price: 279000, badge: 'new', condition: 'Brand New',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
    variants: [{ size: 'S', stock: 0 }, { size: 'M', stock: 4 }, { size: 'L', stock: 5 }]
  }
];

export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/produk`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return { data: MOCK_PRODUCTS };
  }
}
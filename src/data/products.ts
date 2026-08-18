/**
 * Product Catalog Data Structure
 * Note: Pricing (mrp, sellingPrice), stock, and active status are dynamically
 * managed from the Supabase database and updated via the Admin Portal (/admin/products).
 */
export interface Product {
  id: string;
  name: string;
  category: string;
  composition: string;
  benefits: string[];
  usage: string;
  packSize?: string;
  mrp?: number;
  sellingPrice?: number;
  isActive?: boolean;
  shelfLife: string;
  safetyNote: string;
  image?: string; // Image path reference
  transparentImage?: string; // Transparent image path reference
  galleryImages?: string[]; // Multiple gallery images for thumbnail row
}

export function getDefaultProductImage(id?: string): string {
  switch (id) {
    case 'dr-lion-pain-cream':
      return '/products/dr-lion-pain-cream/pain-cream-front-view.webp';
    case 'dr-lion-pain-pills':
      return '/products/dr-lion-pain-pills/pain-pills.webp';
    case 'moon-light-cream':
      return '/products/Moon-light/moon-cream-front-view.webp';
    default:
      return '/products/logo/logo.webp';
  }
}

export const products: Product[] = [
  {
    id: "dr-lion-pain-cream",
    name: "Dr. Lion Pain Cream",
    category: "Ayurvedic External Pain Relief Cream",
    composition: "Sarsapa Thila (30 ml), Thymol (10 ml), Menthol (10 ml), Camphor (10 ml), Bees Wax (40 g) per 100 gms as shown on label",
    benefits: [
      "Supports joint comfort",
      "Helps soothe muscle discomfort",
      "Cooling herbal formulation",
      "Easy external application"
    ],
    usage: "Apply an adequate amount to the affected area and gently massage until absorbed. Use as directed on label or by a qualified healthcare professional.",
    shelfLife: "3 Years",
    safetyNote: "Ayurvedic cream for external use only",
    packSize: "100g Jar",
    isActive: true,
    image: "/products/dr-lion-pain-cream/pain-cream-front-view.webp",
    transparentImage: "/products/dr-lion-pain-cream/pain-cream-front-view.webp",
    galleryImages: ["/products/dr-lion-pain-cream/pain-cream_gallery1.webp"]
  },
  {
    id: "dr-lion-pain-pills",
    name: "Dr. Lion Pain Pills",
    category: "Ayurvedic Proprietary Medicine",
    composition: "Hingula Shuddha/Purified, Triphala Churna, Amalaki, Haritaki, Vibhitaki, Krishna Jeeraka, Kuberakshi, Sonti, Akarakarabha, Jambeera Swarasa (as shown on label)",
    benefits: [
      "Supports joint comfort",
      "Supports musculoskeletal wellness",
      "Traditionally used for Vata-related discomfort",
      "Supports skeletal muscle wellness"
    ],
    usage: "1–2 pills daily or as directed by a qualified healthcare professional.",
    shelfLife: "2 Years",
    safetyNote: "Use only as directed. Consult a qualified healthcare professional for individual conditions.",
    packSize: "60 Pills Container",
    isActive: true,
    image: "/products/dr-lion-pain-pills/pain-pills.webp",
    transparentImage: "/products/dr-lion-pain-pills/pain-pills.webp",
    galleryImages: ["/products/dr-lion-pain-pills/pain_pills_gallery1.webp"]
  },
  {
    id: "moon-light-cream",
    name: "Moon Light Cream",
    category: "Ayurvedic Skin Care Cream",
    composition: "Manjishta Churna (1 gm), Chandana Churna (1 gm), Bahlika Flower / Kumkuma Puvvu (1 gm), Japhal Churna (1 gm), Chandana Oil (2 ml), Bees Wax (4 gms) per 10 gms as shown on label",
    benefits: [
      "Supports healthy-looking skin",
      "Supports even-looking tone",
      "May help improve appearance of dark spots with regular skincare use",
      "Suitable for daily skincare"
    ],
    usage: "Clean the skin and apply a small amount evenly. Use regularly as directed.",
    shelfLife: "3 Years",
    safetyNote: "Ayurvedic cream for external use only",
    packSize: "100g Jar",
    isActive: true,
    image: "/products/Moon-light/moon-cream-front-view.webp",
    transparentImage: "/products/Moon-light/moon-cream-front-view.webp",
    galleryImages: [
      "/products/Moon-light/moon-cream-hero-section.webp",
      "/products/Moon-light/moon_light_gallery1.webp"
    ]
  }
];

export const PRODUCTS = products;

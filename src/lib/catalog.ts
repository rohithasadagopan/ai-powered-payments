export type Product = {
  id: string;
  name: string;
  price: number; // USD
  category: string;
  tags: string[];
  description: string;
};

export const CATALOG: Product[] = [
  { id: "p01", name: "Aero Wireless Headphones", price: 129, category: "Audio", tags: ["noise cancelling", "travel", "music", "work"], description: "Over-ear, 40h battery, active noise cancelling." },
  { id: "p02", name: "Pocket Bluetooth Speaker", price: 39, category: "Audio", tags: ["outdoor", "waterproof", "party", "gift"], description: "IPX7 waterproof, 12h playtime, clip-on." },
  { id: "p03", name: "Stoneware Pour-Over Set", price: 48, category: "Kitchen", tags: ["coffee", "gift", "morning", "home"], description: "Ceramic dripper, carafe and two cups." },
  { id: "p04", name: "Burr Coffee Grinder", price: 89, category: "Kitchen", tags: ["coffee", "precision", "home"], description: "40 grind settings, quiet conical burrs." },
  { id: "p05", name: "Linen Hardcover Journal", price: 22, category: "Stationery", tags: ["writing", "gift", "student", "planning"], description: "A5 dotted pages, lay-flat binding." },
  { id: "p06", name: "Fineliner Pen Set (12)", price: 16, category: "Stationery", tags: ["art", "student", "writing", "gift"], description: "Archival ink, 0.4mm tips, 12 colors." },
  { id: "p07", name: "Trail Running Shoes", price: 115, category: "Fitness", tags: ["running", "outdoor", "hiking"], description: "Grippy outsole, breathable mesh upper." },
  { id: "p08", name: "Cork Yoga Mat", price: 58, category: "Fitness", tags: ["yoga", "eco", "home workout", "wellness"], description: "Natural cork top, non-slip rubber base." },
  { id: "p09", name: "Insulated Steel Bottle", price: 28, category: "Outdoor", tags: ["hydration", "hiking", "eco", "travel", "gift"], description: "Keeps drinks cold 24h, hot 12h. 750ml." },
  { id: "p10", name: "Ultralight Daypack 20L", price: 64, category: "Outdoor", tags: ["hiking", "travel", "commute"], description: "Water-resistant, laptop sleeve, 480g." },
  { id: "p11", name: "Desk Lamp with Wireless Charger", price: 54, category: "Workspace", tags: ["work", "student", "desk", "tech"], description: "Dimmable LED, Qi charging pad in base." },
  { id: "p12", name: "Mechanical Keyboard (Compact)", price: 99, category: "Workspace", tags: ["work", "gaming", "tech", "typing"], description: "75% layout, hot-swap switches, backlit." },
  { id: "p13", name: "Snake Plant in Clay Pot", price: 34, category: "Home", tags: ["plant", "home", "gift", "low maintenance"], description: "Air-purifying, thrives in low light." },
  { id: "p14", name: "Soy Candle Trio", price: 30, category: "Home", tags: ["relax", "gift", "wellness", "home"], description: "Cedar, fig and sea salt. 40h burn each." },
  { id: "p15", name: "Weighted Sleep Mask", price: 26, category: "Wellness", tags: ["sleep", "travel", "relax", "wellness"], description: "Gentle pressure, total blackout." },
  { id: "p16", name: "Smart Fitness Band", price: 79, category: "Fitness", tags: ["running", "sleep", "tech", "wellness"], description: "Heart rate, sleep tracking, 10-day battery." },
];

export const productById = (id: string) => CATALOG.find((p) => p.id === id);

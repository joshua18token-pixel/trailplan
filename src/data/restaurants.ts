// ============================================================
// Restaurant / Dining Database — Yosemite Area
// In production, this would come from Yelp Fusion API
// ============================================================

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceLevel: 1 | 2 | 3 | 4;  // $ $$ $$$ $$$$
  rating: number;               // 1-5
  reviewCount: number;
  address: string;
  location: string;             // area name
  coordinates: { lat: number; lng: number };
  phone?: string;
  yelpUrl?: string;
  image?: string;
  hours?: string;
  distance?: number;            // computed at runtime (miles)
  tags: string[];
}

// Real restaurants in and around Yosemite
export const yosemiteRestaurants: Restaurant[] = [
  // Yosemite Valley
  {
    id: "ahwahnee-dining",
    name: "The Ahwahnee Dining Room",
    cuisine: "American (Fine Dining)",
    priceLevel: 4,
    rating: 4.3,
    reviewCount: 1842,
    address: "1 Ahwahnee Dr, Yosemite Valley",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7468, lng: -119.5750 },
    yelpUrl: "https://www.yelp.com/biz/the-ahwahnee-dining-room-yosemite-national-park",
    hours: "7:00 AM – 9:00 PM",
    tags: ["fine dining", "breakfast", "dinner", "scenic views", "dress code"],
  },
  {
    id: "mountain-room",
    name: "Mountain Room Restaurant",
    cuisine: "American (Casual)",
    priceLevel: 3,
    rating: 4.0,
    reviewCount: 986,
    address: "Yosemite Valley Lodge, 9006 Yosemite Lodge Dr",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7455, lng: -119.5983 },
    yelpUrl: "https://www.yelp.com/biz/mountain-room-restaurant-yosemite-national-park",
    hours: "5:00 PM – 9:00 PM",
    tags: ["steaks", "dinner", "yosemite falls view", "cocktails"],
  },
  {
    id: "base-camp-eatery",
    name: "Base Camp Eatery",
    cuisine: "American (Casual)",
    priceLevel: 2,
    rating: 3.8,
    reviewCount: 624,
    address: "Yosemite Valley Lodge",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7455, lng: -119.5983 },
    yelpUrl: "https://www.yelp.com/biz/base-camp-eatery-yosemite-national-park",
    hours: "6:30 AM – 9:00 PM",
    tags: ["breakfast", "lunch", "dinner", "family-friendly", "cafeteria style"],
  },
  {
    id: "degnans-kitchen",
    name: "Degnan's Kitchen",
    cuisine: "Deli / Sandwiches",
    priceLevel: 2,
    rating: 3.6,
    reviewCount: 412,
    address: "Yosemite Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7490, lng: -119.5872 },
    yelpUrl: "https://www.yelp.com/biz/degnans-kitchen-yosemite-national-park",
    hours: "7:00 AM – 5:00 PM",
    tags: ["sandwiches", "salads", "lunch", "quick service", "pizza"],
  },
  {
    id: "curry-village-pizza",
    name: "Curry Village Pizza Patio",
    cuisine: "Pizza",
    priceLevel: 2,
    rating: 3.5,
    reviewCount: 534,
    address: "Half Dome Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7387, lng: -119.5711 },
    yelpUrl: "https://www.yelp.com/biz/curry-village-pizza-patio-yosemite-national-park",
    hours: "11:00 AM – 9:00 PM",
    tags: ["pizza", "lunch", "dinner", "family-friendly", "outdoor seating"],
  },
  {
    id: "curry-village-bar",
    name: "Curry Village Bar",
    cuisine: "Bar & Grill",
    priceLevel: 2,
    rating: 3.7,
    reviewCount: 289,
    address: "Half Dome Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7387, lng: -119.5711 },
    hours: "12:00 PM – 9:00 PM",
    tags: ["burgers", "drinks", "casual", "lunch", "dinner"],
  },
  {
    id: "village-grill",
    name: "Village Grill Deck",
    cuisine: "American (Fast Food)",
    priceLevel: 1,
    rating: 3.4,
    reviewCount: 356,
    address: "Yosemite Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7490, lng: -119.5872 },
    hours: "11:00 AM – 5:00 PM",
    tags: ["burgers", "fries", "lunch", "quick", "family-friendly"],
  },
  {
    id: "ahwahnee-bar",
    name: "The Ahwahnee Bar",
    cuisine: "Bar / Cocktails",
    priceLevel: 3,
    rating: 4.1,
    reviewCount: 678,
    address: "1 Ahwahnee Dr, Yosemite Valley",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7468, lng: -119.5750 },
    hours: "11:30 AM – 10:00 PM",
    tags: ["cocktails", "appetizers", "lunch", "dinner", "casual elegant"],
  },
  // Tuolumne Meadows
  {
    id: "tuolumne-grill",
    name: "Tuolumne Meadows Grill",
    cuisine: "American (Casual)",
    priceLevel: 1,
    rating: 4.0,
    reviewCount: 234,
    address: "Tioga Road, Tuolumne Meadows",
    location: "Tuolumne Meadows",
    coordinates: { lat: 37.8735, lng: -119.3594 },
    hours: "8:00 AM – 5:00 PM (seasonal)",
    tags: ["breakfast", "lunch", "pancakes", "burgers", "seasonal"],
  },
  // Mariposa (outside park)
  {
    id: "happy-burger",
    name: "Happy Burger Diner",
    cuisine: "American (Diner)",
    priceLevel: 1,
    rating: 4.2,
    reviewCount: 876,
    address: "5120 CA-140, Mariposa",
    location: "Mariposa",
    coordinates: { lat: 37.4847, lng: -119.9665 },
    yelpUrl: "https://www.yelp.com/biz/happy-burger-diner-mariposa",
    hours: "6:00 AM – 9:00 PM",
    tags: ["breakfast", "lunch", "dinner", "burgers", "milkshakes", "family-friendly"],
  },
  {
    id: "charles-street",
    name: "Charles Street Dinner House",
    cuisine: "Steakhouse",
    priceLevel: 3,
    rating: 4.4,
    reviewCount: 542,
    address: "5043 CA-140, Mariposa",
    location: "Mariposa",
    coordinates: { lat: 37.4842, lng: -119.9657 },
    yelpUrl: "https://www.yelp.com/biz/charles-street-dinner-house-mariposa",
    hours: "5:00 PM – 9:00 PM",
    tags: ["steaks", "dinner", "wine", "date night"],
  },
  {
    id: "savoury-mariposa",
    name: "Savoury's",
    cuisine: "American (New)",
    priceLevel: 3,
    rating: 4.5,
    reviewCount: 389,
    address: "5034 CA-140, Mariposa",
    location: "Mariposa",
    coordinates: { lat: 37.4841, lng: -119.9653 },
    yelpUrl: "https://www.yelp.com/biz/savourys-mariposa",
    hours: "5:00 PM – 9:00 PM",
    tags: ["dinner", "locally sourced", "seasonal menu", "wine"],
  },
  // El Portal (park entrance)
  {
    id: "june-bug-cafe",
    name: "June Bug Café",
    cuisine: "American (Casual)",
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 312,
    address: "6979 CA-140, Midpines",
    location: "Midpines",
    coordinates: { lat: 37.5633, lng: -119.9048 },
    yelpUrl: "https://www.yelp.com/biz/june-bug-cafe-midpines",
    hours: "7:00 AM – 9:00 PM",
    tags: ["breakfast", "lunch", "dinner", "organic", "vegetarian-friendly"],
  },
  {
    id: "parkside-pizza",
    name: "River Rock Inn & Deli Garden Café",
    cuisine: "Café / Deli",
    priceLevel: 2,
    rating: 4.1,
    reviewCount: 198,
    address: "4993 7th St, El Portal",
    location: "El Portal",
    coordinates: { lat: 37.6720, lng: -119.7873 },
    hours: "7:00 AM – 3:00 PM",
    tags: ["breakfast", "lunch", "coffee", "deli"],
  },
  // Groveland (west entrance)
  {
    id: "iron-door-saloon",
    name: "Iron Door Saloon & Grill",
    cuisine: "American (Bar & Grill)",
    priceLevel: 2,
    rating: 4.0,
    reviewCount: 723,
    address: "18761 Main St, Groveland",
    location: "Groveland",
    coordinates: { lat: 37.8413, lng: -120.2302 },
    yelpUrl: "https://www.yelp.com/biz/iron-door-saloon-and-grill-groveland",
    hours: "11:00 AM – 9:00 PM",
    tags: ["lunch", "dinner", "historic", "burgers", "beer"],
  },
  {
    id: "two-guys-pizza",
    name: "Two Guys Pizza Pies",
    cuisine: "Pizza",
    priceLevel: 2,
    rating: 4.3,
    reviewCount: 445,
    address: "18955 Ferretti Rd, Groveland",
    location: "Groveland",
    coordinates: { lat: 37.8420, lng: -120.2275 },
    yelpUrl: "https://www.yelp.com/biz/two-guys-pizza-pies-groveland",
    hours: "11:00 AM – 9:00 PM",
    tags: ["pizza", "lunch", "dinner", "family-friendly"],
  },
  // Fish Camp (south entrance)
  {
    id: "tenaya-lodge-embers",
    name: "Embers at Tenaya Lodge",
    cuisine: "American (Fine Dining)",
    priceLevel: 4,
    rating: 4.2,
    reviewCount: 287,
    address: "1122 CA-41, Fish Camp",
    location: "Fish Camp",
    coordinates: { lat: 37.4776, lng: -119.6302 },
    hours: "5:30 PM – 9:00 PM",
    tags: ["dinner", "fine dining", "steaks", "wine", "romantic"],
  },
  {
    id: "tenaya-lodge-jackalope",
    name: "Jackalope's Bar & Grill",
    cuisine: "American (Casual)",
    priceLevel: 2,
    rating: 3.9,
    reviewCount: 198,
    address: "1122 CA-41, Fish Camp",
    location: "Fish Camp",
    coordinates: { lat: 37.4776, lng: -119.6302 },
    hours: "11:00 AM – 10:00 PM",
    tags: ["lunch", "dinner", "burgers", "casual", "sports bar"],
  },
  // Grocery / General Stores (for self-cook option)
  {
    id: "village-store",
    name: "Yosemite Village Store",
    cuisine: "Grocery / General Store",
    priceLevel: 2,
    rating: 3.5,
    reviewCount: 412,
    address: "Yosemite Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7490, lng: -119.5872 },
    hours: "8:00 AM – 8:00 PM",
    tags: ["groceries", "snacks", "camping supplies", "firewood", "self-cook"],
  },
  {
    id: "curry-village-store",
    name: "Curry Village General Store",
    cuisine: "Grocery / General Store",
    priceLevel: 2,
    rating: 3.3,
    reviewCount: 234,
    address: "Half Dome Village",
    location: "Yosemite Valley",
    coordinates: { lat: 37.7387, lng: -119.5711 },
    hours: "8:00 AM – 7:00 PM",
    tags: ["groceries", "snacks", "camping supplies", "self-cook"],
  },
];

// --- Helpers ---

const EARTH_RADIUS_MILES = 3958.8;

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

export function findNearbyRestaurants(
  lat: number,
  lng: number,
  radiusMiles: number = 10,
  options?: {
    cuisine?: string;
    priceLevel?: number;
    tags?: string[];
    mealType?: string; // "breakfast" | "lunch" | "dinner"
  }
): Restaurant[] {
  return yosemiteRestaurants
    .map((r) => ({
      ...r,
      distance: haversineDistance(lat, lng, r.coordinates.lat, r.coordinates.lng),
    }))
    .filter((r) => r.distance <= radiusMiles)
    .filter((r) => {
      if (options?.cuisine && !r.cuisine.toLowerCase().includes(options.cuisine.toLowerCase())) return false;
      if (options?.priceLevel && r.priceLevel > options.priceLevel) return false;
      if (options?.mealType && !r.tags.some((t) => t.includes(options.mealType!))) return false;
      if (options?.tags && !options.tags.some((t) => r.tags.includes(t))) return false;
      return true;
    })
    .sort((a, b) => a.distance - b.distance);
}

export function getPriceLevelString(level: number): string {
  return "$".repeat(level);
}

export function getRatingStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3 ? "½" : "";
  return "★".repeat(full) + half + "☆".repeat(5 - full - (half ? 1 : 0));
}

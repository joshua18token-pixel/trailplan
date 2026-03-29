// ============================================================
// TrailPlan Mock Data — Comprehensive prototype dataset
// ============================================================

// --- Type Definitions ---

export type ActivityType = "hiking" | "biking" | "fishing" | "kayaking" | "sightseeing" | "camping";
export type Difficulty = "easy" | "moderate" | "hard" | "expert";
export type TimeSlot = "morning" | "afternoon" | "evening";

export interface Park {
  id: string;
  name: string;
  description: string;
  heroImage: string;
  coordinates: { lat: number; lng: number };
  bestSeason: string;
  region: string;
  activityCount?: number;
}

export interface Activity {
  id: string;
  name: string;
  parkId: string;
  type: ActivityType;
  difficulty: Difficulty;
  distance: number; // miles
  elevationGain: number; // feet
  duration: string;
  description: string;
  coordinates: { lat: number; lng: number };
  permitRequired: boolean;
  tips: string[];
  ratings: {
    scenery: number;
    difficulty: number;
    crowds: number;
  };
  image: string;
  dogFriendly: boolean;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MealStyle = "restaurant" | "packed" | "campfire" | "grocery" | "picnic";

export interface TravelSegment {
  from: string;          // location name
  to: string;            // location name
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  driveTime: string;     // e.g. "45 min" — default/fallback
  distance: string;      // e.g. "32 miles" — default/fallback
  notes?: string;        // e.g. "Scenic route via Tioga Road"
}

export interface MealStop {
  type: MealType;
  style: MealStyle;
  name: string;          // restaurant name or "Packed lunch"
  location?: string;     // where
  time?: string;         // e.g. "12:00 PM"
  cost?: string;         // e.g. "$15-25/person"
  notes?: string;
}

export type SlotType = "activity" | "note" | "destination";

export interface ItinerarySlot {
  id?: string;           // unique ID for drag-and-drop
  activityId: string;    // references activity DB for type="activity", empty for notes/destinations
  timeSlot: TimeSlot;
  notes?: string;
  startTime?: string;    // e.g. "8:00 AM"
  endTime?: string;      // e.g. "11:30 AM"
  slotType?: SlotType;   // "activity" (default) | "note" | "destination"
  customTitle?: string;  // for notes and destinations
  customDuration?: string; // e.g. "1-2 hours"
  customLocation?: string; // for destinations
}

export interface ItineraryDay {
  day: number;
  date: string;
  slots: ItinerarySlot[];
  lodging?: string;
  lodgingDepartTime?: string;  // e.g. "7:00 AM"
  lodgingArriveTime?: string;  // e.g. "6:30 PM"
  meals: MealStop[];
  travel: TravelSegment[];
}

export interface Itinerary {
  id: string;
  name: string;
  parkId: string;
  days: ItineraryDay[];
}

export interface Permit {
  id: string;
  name: string;
  activityId?: string;
  required: boolean;
  status: "obtained" | "not-yet" | "lottery";
  lotteryDate?: string;
  deadlineDate?: string;
  link: string;
  cost: string;
  notes: string;
}

// --- Parks ---

export const parks: Park[] = [
  {
    id: "yosemite",
    name: "Yosemite National Park",
    description: "Iconic granite cliffs, waterfalls, giant sequoias, and vast wilderness in California's Sierra Nevada.",
    heroImage: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1200&q=80",
    coordinates: { lat: 37.8651, lng: -119.5383 },
    bestSeason: "May – October",
    region: "West",
  },
  {
    id: "zion",
    name: "Zion National Park",
    description: "Red rock canyons, emerald pools, and towering sandstone cliffs in southern Utah.",
    heroImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&q=80",
    coordinates: { lat: 37.2982, lng: -113.0263 },
    bestSeason: "March – November",
    region: "West",
  },
  {
    id: "grand-canyon",
    name: "Grand Canyon National Park",
    description: "A mile-deep gorge carved by the Colorado River, revealing millions of years of geological history.",
    heroImage: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1200&q=80",
    coordinates: { lat: 36.1069, lng: -112.1129 },
    bestSeason: "March – May, September – November",
    region: "West",
  },
  {
    id: "glacier",
    name: "Glacier National Park",
    description: "Pristine forests, alpine meadows, rugged mountains, and spectacular lakes in Montana.",
    heroImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
    coordinates: { lat: 48.7596, lng: -113.787 },
    bestSeason: "June – September",
    region: "West",
  },
  {
    id: "yellowstone",
    name: "Yellowstone National Park",
    description: "The world's first national park — home to geysers, hot springs, and abundant wildlife.",
    heroImage: "https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=1200&q=80",
    coordinates: { lat: 44.428, lng: -110.5885 },
    bestSeason: "May – September",
    region: "West",
  },
  {
    id: "acadia",
    name: "Acadia National Park",
    description: "Rocky coastline, woodland trails, and the tallest mountain on the US Atlantic coast in Maine.",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    coordinates: { lat: 44.3386, lng: -68.2733 },
    bestSeason: "June – October",
    region: "East",
  },
];

// Helper to get park activity counts
export function getActivityCountForPark(parkId: string): number {
  return activities.filter((a) => a.parkId === parkId).length;
}

export function getParkById(id: string): Park | undefined {
  return parks.find((p) => p.id === id);
}

export function getActivityById(id: string): Activity | undefined {
  return activities.find((a) => a.id === id);
}

export function getActivitiesForPark(parkId: string): Activity[] {
  return activities.filter((a) => a.parkId === parkId);
}

// --- Activities ---

export const activities: Activity[] = [
  // Yosemite (5 activities)
  {
    id: "half-dome",
    name: "Half Dome Day Hike",
    parkId: "yosemite",
    type: "hiking",
    difficulty: "expert",
    distance: 14.2,
    elevationGain: 4800,
    duration: "10-12 hours",
    description: "The iconic Half Dome hike is one of Yosemite's most famous and challenging trails. The final 400 feet ascend via steel cables bolted into the granite.",
    coordinates: { lat: 37.746, lng: -119.5332 },
    permitRequired: true,
    tips: [
      "Permits required via lottery — apply in March",
      "Start before dawn to avoid afternoon thunderstorms",
      "Bring gloves for the cable section",
      "Carry at least 4 liters of water",
    ],
    ratings: { scenery: 10, difficulty: 9, crowds: 6 },
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "mist-trail",
    name: "Mist Trail to Vernal Fall",
    parkId: "yosemite",
    type: "hiking",
    difficulty: "moderate",
    distance: 5.4,
    elevationGain: 1000,
    duration: "3-4 hours",
    description: "A stunning hike along the Merced River to the base and top of Vernal Fall. Expect to get wet from the mist!",
    coordinates: { lat: 37.7274, lng: -119.5425 },
    permitRequired: false,
    tips: [
      "Wear a rain jacket — the mist is real",
      "Trail is slippery, wear good shoes",
      "Go early to beat crowds",
    ],
    ratings: { scenery: 9, difficulty: 5, crowds: 8 },
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "valley-loop",
    name: "Yosemite Valley Loop",
    parkId: "yosemite",
    type: "biking",
    difficulty: "easy",
    distance: 11.5,
    elevationGain: 100,
    duration: "2-3 hours",
    description: "A flat, paved bike path looping through Yosemite Valley with views of El Capitan, Bridalveil Fall, and Half Dome.",
    coordinates: { lat: 37.7455, lng: -119.5936 },
    permitRequired: false,
    tips: [
      "Rent bikes at Yosemite Valley Lodge",
      "Best in early morning or late afternoon",
      "Bring a lock to stop at viewpoints",
    ],
    ratings: { scenery: 9, difficulty: 2, crowds: 7 },
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "tuolumne-meadows",
    name: "Tuolumne Meadows Sightseeing",
    parkId: "yosemite",
    type: "sightseeing",
    difficulty: "easy",
    distance: 2.0,
    elevationGain: 50,
    duration: "1-2 hours",
    description: "Wander through the stunning high-altitude meadows at 8,600 feet, surrounded by granite domes and peaks.",
    coordinates: { lat: 37.8735, lng: -119.3594 },
    permitRequired: false,
    tips: [
      "Only accessible in summer (Tioga Road closed in winter)",
      "Great for photography at sunrise/sunset",
      "Watch for marmots!",
    ],
    ratings: { scenery: 8, difficulty: 1, crowds: 4 },
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "merced-river-fishing",
    name: "Merced River Fly Fishing",
    parkId: "yosemite",
    type: "fishing",
    difficulty: "moderate",
    distance: 1.0,
    elevationGain: 0,
    duration: "3-5 hours",
    description: "Fly fishing on the Merced River for rainbow and brown trout in one of the most scenic settings in the world.",
    coordinates: { lat: 37.7369, lng: -119.5655 },
    permitRequired: false,
    tips: [
      "California fishing license required",
      "Catch-and-release only in some areas",
      "Best fishing is in spring and fall",
    ],
    ratings: { scenery: 8, difficulty: 5, crowds: 3 },
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    dogFriendly: false,
  },
  // Zion (4 activities)
  {
    id: "angels-landing",
    name: "Angels Landing",
    parkId: "zion",
    type: "hiking",
    difficulty: "hard",
    distance: 5.4,
    elevationGain: 1488,
    duration: "4-5 hours",
    description: "A thrilling hike with chain-assisted scrambles along a narrow spine of rock with 1,000-foot drop-offs on both sides.",
    coordinates: { lat: 37.2693, lng: -112.9465 },
    permitRequired: true,
    tips: [
      "Permit required via lottery since 2022",
      "Not for those afraid of heights",
      "Avoid during rain or ice",
      "Start early for sunrise views",
    ],
    ratings: { scenery: 10, difficulty: 8, crowds: 7 },
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "narrows",
    name: "The Narrows",
    parkId: "zion",
    type: "hiking",
    difficulty: "hard",
    distance: 9.4,
    elevationGain: 334,
    duration: "6-8 hours",
    description: "Hike through the Virgin River in a slot canyon where walls tower 1,000 feet above. You will be wading in water for most of the hike.",
    coordinates: { lat: 37.3158, lng: -112.9483 },
    permitRequired: false,
    tips: [
      "Rent canyoneering shoes and a walking stick",
      "Check flash flood warnings before going",
      "Waterproof bags for electronics",
    ],
    ratings: { scenery: 10, difficulty: 7, crowds: 6 },
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "zion-canyon-scenic",
    name: "Zion Canyon Scenic Drive",
    parkId: "zion",
    type: "sightseeing",
    difficulty: "easy",
    distance: 12.0,
    elevationGain: 0,
    duration: "2-3 hours",
    description: "Ride the free shuttle through Zion Canyon, stopping at iconic viewpoints and trailheads.",
    coordinates: { lat: 37.2502, lng: -112.9513 },
    permitRequired: false,
    tips: [
      "Shuttle runs March–November",
      "Get on at the Visitor Center early",
      "Every stop has something worth seeing",
    ],
    ratings: { scenery: 9, difficulty: 1, crowds: 8 },
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
    dogFriendly: true,
  },
  {
    id: "zion-kayak",
    name: "Virgin River Kayaking",
    parkId: "zion",
    type: "kayaking",
    difficulty: "moderate",
    distance: 6.0,
    elevationGain: 0,
    duration: "3-4 hours",
    description: "Paddle through red rock canyons on the Virgin River with stunning views at every turn.",
    coordinates: { lat: 37.215, lng: -112.984 },
    permitRequired: false,
    tips: [
      "Best in spring when water levels are higher",
      "Wear quick-dry clothing",
      "Guided tours available from Springdale",
    ],
    ratings: { scenery: 9, difficulty: 5, crowds: 3 },
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80",
    dogFriendly: false,
  },
  // Grand Canyon (4 activities)
  {
    id: "bright-angel",
    name: "Bright Angel Trail",
    parkId: "grand-canyon",
    type: "hiking",
    difficulty: "hard",
    distance: 12.0,
    elevationGain: 4380,
    duration: "8-12 hours",
    description: "The most popular below-the-rim trail, descending from the South Rim to the Colorado River with rest stops and water along the way.",
    coordinates: { lat: 36.0575, lng: -112.1435 },
    permitRequired: true,
    tips: [
      "Do NOT attempt rim-to-river and back in one day",
      "Carry at least 1 gallon of water per person",
      "Start before sunrise in summer",
      "Permit needed for overnight camping below the rim",
    ],
    ratings: { scenery: 10, difficulty: 8, crowds: 7 },
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "south-rim-trail",
    name: "South Rim Trail",
    parkId: "grand-canyon",
    type: "hiking",
    difficulty: "easy",
    distance: 13.0,
    elevationGain: 200,
    duration: "4-6 hours",
    description: "A mostly flat, paved trail along the South Rim with spectacular canyon views. Can be done in sections.",
    coordinates: { lat: 36.0586, lng: -112.1401 },
    permitRequired: false,
    tips: [
      "Wheelchair accessible for much of it",
      "Shuttle buses connect trailheads",
      "Best light at sunrise and sunset",
    ],
    ratings: { scenery: 9, difficulty: 2, crowds: 9 },
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    dogFriendly: true,
  },
  {
    id: "colorado-river-raft",
    name: "Colorado River Rafting",
    parkId: "grand-canyon",
    type: "kayaking",
    difficulty: "expert",
    distance: 226.0,
    elevationGain: 0,
    duration: "12-18 days",
    description: "The ultimate Grand Canyon experience — a multi-day rafting trip through the inner gorge with Class III-V rapids.",
    coordinates: { lat: 36.0869, lng: -111.8261 },
    permitRequired: true,
    tips: [
      "Commercial trips book up a year in advance",
      "Private permits via weighted lottery",
      "Expect no cell service for the entire trip",
    ],
    ratings: { scenery: 10, difficulty: 9, crowds: 1 },
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "desert-view",
    name: "Desert View Watchtower",
    parkId: "grand-canyon",
    type: "sightseeing",
    difficulty: "easy",
    distance: 0.5,
    elevationGain: 85,
    duration: "1 hour",
    description: "Visit the historic Mary Colter–designed watchtower with panoramic views of the canyon, Painted Desert, and the Colorado River.",
    coordinates: { lat: 36.0435, lng: -111.8269 },
    permitRequired: false,
    tips: [
      "Less crowded than Grand Canyon Village",
      "Great sunset spot",
      "Gift shop inside the tower",
    ],
    ratings: { scenery: 9, difficulty: 1, crowds: 5 },
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80",
    dogFriendly: true,
  },
  // Glacier (3 activities)
  {
    id: "highline-trail",
    name: "Highline Trail",
    parkId: "glacier",
    type: "hiking",
    difficulty: "hard",
    distance: 11.8,
    elevationGain: 1960,
    duration: "6-8 hours",
    description: "A breathtaking traverse along the Continental Divide with views of glaciers, valleys, and the Garden Wall.",
    coordinates: { lat: 48.6965, lng: -113.7158 },
    permitRequired: false,
    tips: [
      "Start at Logan Pass, end at The Loop (take shuttle back)",
      "Trail is narrow with exposure — not for vertigo",
      "Snow may linger into July",
    ],
    ratings: { scenery: 10, difficulty: 7, crowds: 5 },
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "avalanche-lake",
    name: "Avalanche Lake Trail",
    parkId: "glacier",
    type: "hiking",
    difficulty: "moderate",
    distance: 5.9,
    elevationGain: 730,
    duration: "3-4 hours",
    description: "Hike through old-growth cedar forest to a stunning glacial lake surrounded by towering cliffs and waterfalls.",
    coordinates: { lat: 48.6241, lng: -113.769 },
    permitRequired: false,
    tips: [
      "One of the most popular hikes — go early",
      "Bear spray recommended",
      "Trail starts at Trail of the Cedars",
    ],
    ratings: { scenery: 9, difficulty: 4, crowds: 7 },
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "glacier-kayak",
    name: "Lake McDonald Kayaking",
    parkId: "glacier",
    type: "kayaking",
    difficulty: "easy",
    distance: 4.0,
    elevationGain: 0,
    duration: "2-3 hours",
    description: "Paddle across crystal-clear Lake McDonald with the colorful rocks visible beneath and mountains reflected in the water.",
    coordinates: { lat: 48.5284, lng: -113.9233 },
    permitRequired: false,
    tips: [
      "Best in calm morning hours",
      "Water is very cold — wear layers",
      "Rentals available at Apgar Village",
    ],
    ratings: { scenery: 10, difficulty: 2, crowds: 4 },
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    dogFriendly: false,
  },
  // Yellowstone (4 activities)
  {
    id: "old-faithful-tour",
    name: "Old Faithful & Geyser Basin",
    parkId: "yellowstone",
    type: "sightseeing",
    difficulty: "easy",
    distance: 3.0,
    elevationGain: 100,
    duration: "2-3 hours",
    description: "Walk the boardwalks of the Upper Geyser Basin, home to Old Faithful and over 150 geysers — the densest geyser field on earth.",
    coordinates: { lat: 44.4605, lng: -110.8281 },
    permitRequired: false,
    tips: [
      "Check predicted eruption times at visitor center",
      "Stay on boardwalks — ground is fragile and dangerous",
      "Visit Morning Glory Pool at the far end",
    ],
    ratings: { scenery: 9, difficulty: 1, crowds: 9 },
    image: "https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "lamar-valley",
    name: "Lamar Valley Wildlife Safari",
    parkId: "yellowstone",
    type: "sightseeing",
    difficulty: "easy",
    distance: 5.0,
    elevationGain: 0,
    duration: "4-6 hours",
    description: "The 'Serengeti of North America' — drive and hike through the valley to spot wolves, bison, elk, grizzly bears, and more.",
    coordinates: { lat: 44.8973, lng: -110.2154 },
    permitRequired: false,
    tips: [
      "Dawn and dusk are best for wildlife",
      "Bring binoculars and a spotting scope",
      "Stay 100 yards from bears and wolves",
    ],
    ratings: { scenery: 8, difficulty: 1, crowds: 4 },
    image: "https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "mount-washburn",
    name: "Mount Washburn Summit",
    parkId: "yellowstone",
    type: "hiking",
    difficulty: "moderate",
    distance: 6.4,
    elevationGain: 1400,
    duration: "4-5 hours",
    description: "Hike to the fire lookout at 10,243 feet for 360-degree views of the Yellowstone caldera and surrounding peaks.",
    coordinates: { lat: 44.7978, lng: -110.4344 },
    permitRequired: false,
    tips: [
      "Two trailheads: Dunraven Pass (shorter) or Chittenden Road",
      "Afternoon thunderstorms common — start early",
      "Watch for bighorn sheep near the summit",
    ],
    ratings: { scenery: 9, difficulty: 5, crowds: 5 },
    image: "https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "yellowstone-lake-fishing",
    name: "Yellowstone Lake Cutthroat Fishing",
    parkId: "yellowstone",
    type: "fishing",
    difficulty: "moderate",
    distance: 2.0,
    elevationGain: 0,
    duration: "4-6 hours",
    description: "Fish for native Yellowstone cutthroat trout in the largest high-altitude lake in North America.",
    coordinates: { lat: 44.4435, lng: -110.3565 },
    permitRequired: true,
    tips: [
      "Yellowstone fishing permit required (available at visitor centers)",
      "Catch-and-release only for native cutthroat",
      "Lake fishing best from shore or float tube in July-August",
    ],
    ratings: { scenery: 8, difficulty: 4, crowds: 3 },
    image: "https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=800&q=80",
    dogFriendly: false,
  },
  // Acadia (4 activities)
  {
    id: "precipice-trail",
    name: "Precipice Trail",
    parkId: "acadia",
    type: "hiking",
    difficulty: "expert",
    distance: 1.6,
    elevationGain: 1000,
    duration: "2-3 hours",
    description: "Acadia's most thrilling trail — iron rungs and ladders bolted into the cliff face of Champlain Mountain.",
    coordinates: { lat: 44.3478, lng: -68.1883 },
    permitRequired: false,
    tips: [
      "Closed during peregrine falcon nesting (spring/summer)",
      "Not for anyone afraid of heights or exposure",
      "Short but incredibly intense",
    ],
    ratings: { scenery: 9, difficulty: 9, crowds: 5 },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    dogFriendly: false,
  },
  {
    id: "cadillac-mountain",
    name: "Cadillac Mountain Sunrise",
    parkId: "acadia",
    type: "sightseeing",
    difficulty: "easy",
    distance: 0.5,
    elevationGain: 50,
    duration: "1-2 hours",
    description: "Watch the first sunrise in the United States from the summit of Cadillac Mountain — the highest point on the Atlantic coast.",
    coordinates: { lat: 44.3525, lng: -68.2256 },
    permitRequired: true,
    tips: [
      "Vehicle reservation required (recreation.gov)",
      "Arrive 30+ min before sunrise",
      "Bring layers — it's windy and cold at the top",
    ],
    ratings: { scenery: 10, difficulty: 1, crowds: 8 },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    dogFriendly: true,
  },
  {
    id: "carriage-roads",
    name: "Carriage Roads Biking",
    parkId: "acadia",
    type: "biking",
    difficulty: "easy",
    distance: 12.0,
    elevationGain: 400,
    duration: "2-4 hours",
    description: "Ride the historic Rockefeller carriage roads — 45 miles of car-free, crushed-stone paths through forests and around lakes.",
    coordinates: { lat: 44.3481, lng: -68.2447 },
    permitRequired: false,
    tips: [
      "Rent bikes in Bar Harbor",
      "Eagle Lake loop is the most scenic",
      "Share the road with hikers and horses",
    ],
    ratings: { scenery: 8, difficulty: 3, crowds: 5 },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    dogFriendly: true,
  },
  {
    id: "acadia-kayak",
    name: "Frenchman Bay Sea Kayaking",
    parkId: "acadia",
    type: "kayaking",
    difficulty: "moderate",
    distance: 8.0,
    elevationGain: 0,
    duration: "3-4 hours",
    description: "Paddle along Acadia's rugged coastline, exploring sea caves, tide pools, and the Porcupine Islands.",
    coordinates: { lat: 44.3917, lng: -68.2042 },
    permitRequired: false,
    tips: [
      "Guided tours recommended for beginners",
      "Tides can be tricky — check before launch",
      "Seals and porpoises often spotted",
    ],
    ratings: { scenery: 9, difficulty: 5, crowds: 3 },
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    dogFriendly: false,
  },
];

// --- Itineraries ---

export const itineraries: Itinerary[] = [
  {
    id: "yosemite-adventure",
    name: "Yosemite Adventure — 5 Days",
    parkId: "yosemite",
    days: [
      {
        day: 1,
        date: "2025-07-14",
        lodgingDepartTime: "7:30 AM",
        lodgingArriveTime: "7:00 PM",
        slots: [
          { activityId: "valley-loop", timeSlot: "morning", startTime: "8:00 AM", endTime: "10:30 AM", notes: "Ease into the trip with a valley bike ride" },
          { activityId: "tuolumne-meadows", timeSlot: "afternoon", startTime: "1:00 PM", endTime: "3:00 PM", notes: "Drive to Tuolumne and explore" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Yosemite Valley Lodge Cafeteria", location: "Yosemite Village", time: "7:00 AM", cost: "$12-18/person" },
          { type: "lunch", style: "packed", name: "Packed sandwiches & trail mix", time: "11:30 AM", notes: "Pack at lodge before departure" },
          { type: "dinner", style: "restaurant", name: "Curry Village Pizza Patio", location: "Half Dome Village", time: "6:00 PM", cost: "$15-25/person" },
        ],
        travel: [
          { from: "Curry Village", to: "Yosemite Valley Bike Rentals", fromCoords: { lat: 37.7387, lng: -119.5711 }, toCoords: { lat: 37.7455, lng: -119.5936 }, driveTime: "5 min", distance: "1.2 miles", notes: "Walk or take shuttle" },
          { from: "Yosemite Valley", to: "Tuolumne Meadows", fromCoords: { lat: 37.7455, lng: -119.5936 }, toCoords: { lat: 37.8735, lng: -119.3594 }, driveTime: "1 hr 15 min", distance: "55 miles", notes: "Scenic drive via Tioga Road (Hwy 120)" },
          { from: "Tuolumne Meadows", to: "Curry Village", fromCoords: { lat: 37.8735, lng: -119.3594 }, toCoords: { lat: 37.7387, lng: -119.5711 }, driveTime: "1 hr 15 min", distance: "55 miles" },
        ],
        lodging: "Curry Village — Half Dome Village Tent Cabin",
      },
      {
        day: 2,
        date: "2025-07-15",
        lodgingDepartTime: "6:30 AM",
        lodgingArriveTime: "6:00 PM",
        slots: [
          { activityId: "mist-trail", timeSlot: "morning", startTime: "7:00 AM", endTime: "11:00 AM", notes: "Hit the Mist Trail early to beat crowds" },
          { activityId: "merced-river-fishing", timeSlot: "afternoon", startTime: "2:00 PM", endTime: "5:30 PM", notes: "Relax with afternoon fly fishing" },
        ],
        meals: [
          { type: "breakfast", style: "packed", name: "Granola bars & fruit", time: "6:15 AM", notes: "Quick breakfast — early start" },
          { type: "lunch", style: "restaurant", name: "Degnan's Kitchen", location: "Yosemite Village", time: "11:30 AM", cost: "$12-20/person", notes: "Deli sandwiches and salads" },
          { type: "dinner", style: "campfire", name: "Camp cookout — burgers & corn", time: "6:30 PM", cost: "$8-12/person", notes: "Grab supplies at Village Store" },
        ],
        travel: [
          { from: "Curry Village", to: "Happy Isles Trailhead", fromCoords: { lat: 37.7387, lng: -119.5711 }, toCoords: { lat: 37.7274, lng: -119.5579 }, driveTime: "10 min", distance: "0.8 miles", notes: "Walk or shuttle — no parking at trailhead" },
          { from: "Happy Isles", to: "Merced River fishing spot", fromCoords: { lat: 37.7274, lng: -119.5579 }, toCoords: { lat: 37.7369, lng: -119.5655 }, driveTime: "15 min", distance: "2 miles", notes: "Easy walk along the river" },
        ],
        lodging: "Curry Village — Half Dome Village Tent Cabin",
      },
      {
        day: 3,
        date: "2025-07-16",
        lodgingDepartTime: "4:30 AM",
        lodgingArriveTime: "7:00 PM",
        slots: [
          { activityId: "half-dome", timeSlot: "morning", startTime: "5:00 AM", endTime: "5:00 PM", notes: "Full day — start before dawn! Permit required." },
        ],
        meals: [
          { type: "breakfast", style: "packed", name: "Energy bars & coffee (thermos)", time: "4:15 AM", notes: "Eat before hitting the trail" },
          { type: "lunch", style: "packed", name: "PB&J, trail mix, jerky, dried fruit", time: "12:00 PM", notes: "Pack high-calorie, lightweight food — eat at Sub Dome" },
          { type: "snack", style: "packed", name: "Electrolyte drinks & energy gels", notes: "Carry at least 4L water + electrolytes" },
          { type: "dinner", style: "restaurant", name: "The Ahwahnee Bar", location: "The Ahwahnee Hotel", time: "7:30 PM", cost: "$25-40/person", notes: "Celebrate the summit! You earned it." },
        ],
        travel: [
          { from: "Curry Village", to: "Happy Isles Trailhead", fromCoords: { lat: 37.7387, lng: -119.5711 }, toCoords: { lat: 37.7274, lng: -119.5579 }, driveTime: "10 min", distance: "0.8 miles", notes: "Headlamp for pre-dawn walk" },
        ],
        lodging: "Curry Village — Half Dome Village Tent Cabin",
      },
      {
        day: 4,
        date: "2025-07-17",
        lodgingDepartTime: "8:30 AM",
        lodgingArriveTime: "8:00 PM",
        slots: [
          { activityId: "tuolumne-meadows", timeSlot: "morning", startTime: "10:00 AM", endTime: "12:00 PM", notes: "Rest day — easy meadow walk & photography" },
          { activityId: "valley-loop", timeSlot: "afternoon", startTime: "3:00 PM", endTime: "5:30 PM", notes: "Leisurely sunset bike ride" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Tuolumne Meadows Grill", location: "Tuolumne Meadows", time: "9:00 AM", cost: "$10-15/person", notes: "Famous buckwheat pancakes" },
          { type: "lunch", style: "picnic", name: "Deli picnic at Tenaya Lake", time: "12:30 PM", cost: "$10-15/person", notes: "Stop at Tenaya Lake on drive back — gorgeous spot" },
          { type: "dinner", style: "restaurant", name: "Mountain Room Restaurant", location: "Yosemite Valley Lodge", time: "7:00 PM", cost: "$30-50/person", notes: "Nice sit-down dinner — views of Yosemite Falls" },
        ],
        travel: [
          { from: "Curry Village", to: "Tuolumne Meadows", fromCoords: { lat: 37.7387, lng: -119.5711 }, toCoords: { lat: 37.8735, lng: -119.3594 }, driveTime: "1 hr 15 min", distance: "55 miles", notes: "Scenic Tioga Road" },
          { from: "Tuolumne Meadows", to: "Tenaya Lake", fromCoords: { lat: 37.8735, lng: -119.3594 }, toCoords: { lat: 37.8317, lng: -119.4499 }, driveTime: "20 min", distance: "8 miles", notes: "Quick stop for picnic" },
          { from: "Tenaya Lake", to: "The Ahwahnee Hotel", fromCoords: { lat: 37.8317, lng: -119.4499 }, toCoords: { lat: 37.7468, lng: -119.5750 }, driveTime: "50 min", distance: "40 miles" },
        ],
        lodging: "The Ahwahnee Hotel",
      },
      {
        day: 5,
        date: "2025-07-18",
        lodgingDepartTime: "7:00 AM",
        lodgingArriveTime: undefined,
        slots: [
          { activityId: "mist-trail", timeSlot: "morning", startTime: "7:30 AM", endTime: "10:30 AM", notes: "One more waterfall before heading home" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "The Ahwahnee Dining Room", location: "The Ahwahnee Hotel", time: "6:00 AM", cost: "$20-30/person", notes: "Treat yourself — iconic breakfast buffet" },
          { type: "lunch", style: "packed", name: "Road trip snacks", time: "12:00 PM", notes: "Pack snacks for the drive home" },
        ],
        travel: [
          { from: "The Ahwahnee Hotel", to: "Happy Isles Trailhead", fromCoords: { lat: 37.7468, lng: -119.5750 }, toCoords: { lat: 37.7274, lng: -119.5579 }, driveTime: "5 min", distance: "1 mile" },
          { from: "Yosemite Valley", to: "San Francisco", fromCoords: { lat: 37.7455, lng: -119.5936 }, toCoords: { lat: 37.7749, lng: -122.4194 }, driveTime: "3-5 hours", distance: "Varies", notes: "Take Hwy 140 out for scenic Merced River canyon views" },
        ],
        lodging: "Departure",
      },
    ],
  },
  {
    id: "yosemite-family",
    name: "Yosemite Family Fun — 5 Days",
    parkId: "yosemite",
    days: [
      {
        day: 1,
        date: "2025-08-01",
        lodgingDepartTime: "8:00 AM",
        lodgingArriveTime: "6:00 PM",
        slots: [
          { activityId: "valley-loop", timeSlot: "morning", startTime: "9:00 AM", endTime: "11:30 AM", notes: "Family bike ride through the valley" },
          { activityId: "tuolumne-meadows", timeSlot: "afternoon", startTime: "2:00 PM", endTime: "4:00 PM", notes: "Easy meadow exploration — kids love the streams" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Base Camp Eatery", location: "Yosemite Valley Lodge", time: "7:30 AM", cost: "$10-15/person" },
          { type: "lunch", style: "packed", name: "Sandwiches & juice boxes", time: "12:00 PM", notes: "Pack for the kids" },
          { type: "dinner", style: "restaurant", name: "Curry Village Pizza Patio", location: "Half Dome Village", time: "5:30 PM", cost: "$12-20/person", notes: "Kid-friendly — pizza & ice cream" },
        ],
        travel: [
          { from: "Yosemite Valley Lodge", to: "Bike Rentals", driveTime: "5 min", distance: "0.3 miles", notes: "Short walk" },
          { from: "Yosemite Valley", to: "Tuolumne Meadows", driveTime: "1 hr 15 min", distance: "55 miles" },
        ],
        lodging: "Yosemite Valley Lodge",
      },
      {
        day: 2,
        date: "2025-08-02",
        lodgingDepartTime: "8:00 AM",
        lodgingArriveTime: "5:00 PM",
        slots: [
          { activityId: "mist-trail", timeSlot: "morning", startTime: "8:30 AM", endTime: "12:00 PM", notes: "Kids will love the waterfall mist — bring rain jackets!" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Base Camp Eatery", location: "Yosemite Valley Lodge", time: "7:30 AM", cost: "$10-15/person" },
          { type: "lunch", style: "restaurant", name: "Degnan's Kitchen", location: "Yosemite Village", time: "12:30 PM", cost: "$10-15/person" },
          { type: "dinner", style: "grocery", name: "Cook at lodge — pasta night", location: "Village Store groceries", time: "6:00 PM", cost: "$8-12/person", notes: "Easy dinner for tired kids" },
        ],
        travel: [
          { from: "Yosemite Valley Lodge", to: "Happy Isles Trailhead", driveTime: "10 min", distance: "1.5 miles", notes: "Take the free shuttle" },
        ],
        lodging: "Yosemite Valley Lodge",
      },
      {
        day: 3,
        date: "2025-08-03",
        lodgingDepartTime: "8:30 AM",
        lodgingArriveTime: "5:30 PM",
        slots: [
          { activityId: "merced-river-fishing", timeSlot: "morning", startTime: "9:00 AM", endTime: "12:00 PM", notes: "Fishing with the family — catch & release" },
          { activityId: "tuolumne-meadows", timeSlot: "afternoon", startTime: "2:00 PM", endTime: "4:00 PM", notes: "Picnic at the meadows" },
        ],
        meals: [
          { type: "breakfast", style: "packed", name: "Cereal & fruit at lodge", time: "8:00 AM" },
          { type: "lunch", style: "picnic", name: "Picnic at Tuolumne Meadows", time: "12:30 PM", notes: "Pack a blanket and snacks" },
          { type: "dinner", style: "restaurant", name: "Yosemite Valley Lodge Dining", time: "6:00 PM", cost: "$15-25/person" },
        ],
        travel: [
          { from: "Yosemite Valley Lodge", to: "Merced River", driveTime: "10 min", distance: "2 miles" },
          { from: "Merced River", to: "Tuolumne Meadows", driveTime: "1 hr 15 min", distance: "55 miles" },
        ],
        lodging: "Yosemite Valley Lodge",
      },
      {
        day: 4,
        date: "2025-08-04",
        lodgingDepartTime: "8:00 AM",
        lodgingArriveTime: "6:00 PM",
        slots: [
          { activityId: "valley-loop", timeSlot: "morning", startTime: "8:30 AM", endTime: "10:30 AM", notes: "Morning ride to El Capitan viewpoint" },
          { activityId: "mist-trail", timeSlot: "afternoon", startTime: "1:00 PM", endTime: "3:30 PM", notes: "One more trip to the falls" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Base Camp Eatery", location: "Yosemite Valley Lodge", time: "7:30 AM", cost: "$10-15/person" },
          { type: "lunch", style: "packed", name: "Packed wraps & fruit", time: "11:00 AM" },
          { type: "dinner", style: "restaurant", name: "The Ahwahnee Dining Room", location: "The Ahwahnee Hotel", time: "6:30 PM", cost: "$35-55/person", notes: "Fancy last dinner — dress code (casual elegant)" },
        ],
        travel: [
          { from: "Yosemite Valley Lodge", to: "Bike Rentals", driveTime: "5 min", distance: "0.3 miles" },
          { from: "Valley Loop", to: "Happy Isles Trailhead", driveTime: "10 min", distance: "1 mile" },
        ],
        lodging: "Yosemite Valley Lodge",
      },
      {
        day: 5,
        date: "2025-08-05",
        lodgingDepartTime: "8:00 AM",
        lodgingArriveTime: undefined,
        slots: [
          { activityId: "tuolumne-meadows", timeSlot: "morning", startTime: "8:30 AM", endTime: "10:00 AM", notes: "Goodbye walk before heading home" },
        ],
        meals: [
          { type: "breakfast", style: "restaurant", name: "Base Camp Eatery", location: "Yosemite Valley Lodge", time: "7:00 AM", cost: "$10-15/person" },
          { type: "lunch", style: "packed", name: "Road trip snacks & sandwiches", time: "12:00 PM", notes: "For the drive home" },
        ],
        travel: [
          { from: "Yosemite Valley Lodge", to: "Tuolumne Meadows", driveTime: "1 hr 15 min", distance: "55 miles" },
          { from: "Yosemite", to: "Home", driveTime: "3-5 hours", distance: "Varies" },
        ],
        lodging: "Departure",
      },
    ],
  },
];

// --- Permits ---

export const permits: Permit[] = [
  {
    id: "half-dome-permit",
    name: "Half Dome Day Hike Permit",
    activityId: "half-dome",
    required: true,
    status: "lottery",
    lotteryDate: "2025-03-01",
    deadlineDate: "2025-03-31",
    link: "https://www.recreation.gov/permits/233262",
    cost: "$10 per person",
    notes: "Pre-season lottery in March, daily lottery 2 days before. 300 permits/day via pre-season, 50 via daily.",
  },
  {
    id: "angels-landing-permit",
    name: "Angels Landing Permit",
    activityId: "angels-landing",
    required: true,
    status: "not-yet",
    lotteryDate: "2025-01-20",
    deadlineDate: "2025-02-20",
    link: "https://www.recreation.gov/permits/274678",
    cost: "$6 per person",
    notes: "Seasonal lottery and day-before lottery available. Permit required year-round.",
  },
  {
    id: "bright-angel-permit",
    name: "Bright Angel Overnight Permit",
    activityId: "bright-angel",
    required: true,
    status: "not-yet",
    deadlineDate: "2025-06-01",
    link: "https://www.nps.gov/grca/planyourvisit/backcountry-permit.htm",
    cost: "$10 + $8/person/night",
    notes: "Backcountry permits required for all overnight camping below the rim. Apply 4 months in advance.",
  },
  {
    id: "cadillac-reservation",
    name: "Cadillac Mountain Vehicle Reservation",
    activityId: "cadillac-mountain",
    required: true,
    status: "obtained",
    link: "https://www.recreation.gov/timed-entry/10088426",
    cost: "$6 per vehicle",
    notes: "Timed-entry vehicle reservation required May 25 – Oct 22. Book as soon as available.",
  },
  {
    id: "yellowstone-fishing",
    name: "Yellowstone Fishing Permit",
    activityId: "yellowstone-lake-fishing",
    required: true,
    status: "not-yet",
    link: "https://www.nps.gov/yell/planyourvisit/fishing.htm",
    cost: "$18 (3-day) / $25 (7-day) / $40 (season)",
    notes: "Available at visitor centers, ranger stations, and general stores in the park. No state license needed.",
  },
  {
    id: "colorado-river-permit",
    name: "Colorado River Private Trip Permit",
    activityId: "colorado-river-raft",
    required: true,
    status: "lottery",
    lotteryDate: "2025-02-25",
    link: "https://www.nps.gov/grca/planyourvisit/weightedlottery.htm",
    cost: "$400 per trip",
    notes: "Weighted lottery for private river trips. Wait times can be years. Consider a commercial trip instead.",
  },
];

// --- Activity Type Emoji Map ---
export const activityTypeEmoji: Record<ActivityType, string> = {
  hiking: "🥾",
  biking: "🚴",
  fishing: "🎣",
  kayaking: "🛶",
  sightseeing: "📸",
  camping: "⛺",
};

export const difficultyColors: Record<Difficulty, string> = {
  easy: "bg-green-500",
  moderate: "bg-yellow-500",
  hard: "bg-orange-500",
  expert: "bg-red-500",
};

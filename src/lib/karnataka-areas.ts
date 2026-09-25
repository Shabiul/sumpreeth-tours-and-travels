/**
 * Karnataka district → town/taluk coverage list (Tier 3 of the local-SEO
 * plan). This is a keyword/coverage reference, not a set of individual
 * "destination guide" pages — one honest page declares service area across
 * real administrative geography, instead of generating hundreds of
 * near-duplicate town pages (a doorway-page pattern Google penalizes).
 *
 * Each town appears once, under its correct district, de-duplicated from
 * the source list (a few towns — Nandi Hills, Srirangapatna, Hosakote,
 * Devanahalli — were listed under more than one neighbouring district).
 */
export type KarnatakaDistrict = {
  district: string;
  towns: string[];
};

export const KARNATAKA_AREAS: KarnatakaDistrict[] = [
  {
    district: "Bengaluru Urban",
    towns: [
      "Bengaluru", "Yelahanka", "Whitefield", "Electronic City", "Anekal",
      "Sarjapur", "KR Puram", "Hebbal", "Marathahalli", "Koramangala",
      "Indiranagar", "JP Nagar", "Jayanagar", "HSR Layout", "BTM Layout",
      "Banashankari", "Rajajinagar", "Malleshwaram",
    ],
  },
  {
    district: "Bengaluru Rural",
    towns: ["Devanahalli", "Doddaballapur", "Nelamangala", "Hosakote", "Vijayapura (Bengaluru Rural)"],
  },
  {
    district: "Ramanagara",
    towns: ["Ramanagara", "Channapatna", "Kanakapura", "Magadi", "Harohalli"],
  },
  {
    district: "Chikkaballapur",
    towns: [
      "Chikkaballapur", "Bagepalli", "Chintamani", "Gauribidanur",
      "Gudibande", "Sidlaghatta", "Nandi Hills",
    ],
  },
  {
    district: "Kolar",
    towns: ["Kolar", "KGF", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur"],
  },
  {
    district: "Tumakuru",
    towns: [
      "Tumakuru", "Kunigal", "Gubbi", "Koratagere", "Madhugiri", "Pavagada",
      "Sira", "Tiptur", "Turuvekere",
    ],
  },
  {
    district: "Mysuru",
    towns: ["Mysuru", "Nanjangud", "Hunsur", "Periyapatna", "H.D. Kote", "K.R. Nagar", "T. Narasipura"],
  },
  {
    district: "Mandya",
    towns: [
      "Mandya", "Maddur", "Malavalli", "Srirangapatna", "Krishnarajpet",
      "Nagamangala", "Pandavapura", "Melkote",
    ],
  },
  {
    district: "Kodagu",
    towns: [
      "Madikeri", "Coorg", "Virajpet", "Somwarpet", "Kushalnagar",
      "Gonikoppal", "Napoklu", "Suntikoppa",
    ],
  },
  {
    district: "Hassan",
    towns: [
      "Hassan", "Sakleshpur", "Belur", "Alur", "Arkalgud", "Arasikere",
      "Channarayapatna", "Holenarasipura",
    ],
  },
  {
    district: "Chikkamagaluru",
    towns: [
      "Chikkamagaluru", "Chikmagalur", "Mudigere", "Koppa", "Sringeri",
      "Tarikere", "Kadur", "Narasimharajapura", "Balehonnur", "Kalasa",
      "Kemmangundi",
    ],
  },
  {
    district: "Shivamogga",
    towns: [
      "Shivamogga", "Shimoga", "Bhadravati", "Sagara", "Shikaripura",
      "Sorab", "Thirthahalli", "Hosanagara", "Jog Falls",
    ],
  },
  {
    district: "Dakshina Kannada",
    towns: [
      "Mangaluru", "Mangalore", "Puttur", "Bantwal", "Belthangady",
      "Sullia", "Moodabidri", "Mulki", "Ullal", "Surathkal",
    ],
  },
  {
    district: "Udupi",
    towns: [
      "Udupi", "Kundapura", "Karkala", "Brahmavar", "Kaup", "Byndoor",
      "Manipal", "Malpe", "Kollur",
    ],
  },
  {
    district: "Uttara Kannada",
    towns: [
      "Karwar", "Kumta", "Gokarna", "Sirsi", "Yellapur", "Ankola",
      "Bhatkal", "Honnavar", "Dandeli", "Haliyal", "Siddapur", "Mundgod",
      "Joida", "Murudeshwar",
    ],
  },
  {
    district: "Chitradurga",
    towns: ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
  },
  {
    district: "Davanagere",
    towns: ["Davanagere", "Harihar", "Channagiri", "Honnali", "Jagalur", "Nyamathi"],
  },
  {
    district: "Belagavi",
    towns: [
      "Belagavi", "Belgaum", "Athani", "Bailhongal", "Chikodi", "Gokak",
      "Hukkeri", "Khanapur", "Nippani", "Raibag", "Ramdurg", "Saundatti",
    ],
  },
  {
    district: "Dharwad",
    towns: ["Hubballi", "Hubli", "Dharwad", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar", "Annigeri"],
  },
  {
    district: "Gadag",
    towns: ["Gadag", "Gajendragad", "Lakshmeshwar", "Mundargi", "Nargund", "Ron", "Shirahatti"],
  },
  {
    district: "Haveri",
    towns: ["Haveri", "Byadgi", "Hangal", "Hirekerur", "Ranebennur", "Savanur", "Shiggaon", "Rattihalli"],
  },
  {
    district: "Bagalkot",
    towns: [
      "Bagalkot", "Badami", "Bilagi", "Guledgudda", "Hungund", "Jamkhandi",
      "Mudhol", "Rabkavi-Banahatti",
    ],
  },
  {
    district: "Vijayapura",
    towns: [
      "Vijayapura", "Bijapur", "Indi", "Basavana Bagewadi", "Muddebihal",
      "Sindagi", "Talikoti", "Devar Hipparagi",
    ],
  },
  {
    district: "Ballari",
    towns: ["Ballari", "Bellary", "Siruguppa", "Kudligi", "Sandur", "Harapanahalli"],
  },
  {
    district: "Vijayanagara",
    towns: ["Hosapete", "Hampi", "Hoovina Hadagali", "Kottur", "Kampli"],
  },
  {
    district: "Koppal",
    towns: ["Koppal", "Gangavathi", "Kanakagiri", "Kushtagi", "Yelburga", "Karatagi"],
  },
  {
    district: "Raichur",
    towns: ["Raichur", "Sindhanur", "Manvi", "Devadurga", "Lingasugur", "Maski", "Sirwar"],
  },
  {
    district: "Yadgir",
    towns: ["Yadgir", "Shahapur", "Shorapur", "Gurmitkal", "Wadgera", "Hunasagi"],
  },
  {
    district: "Kalaburagi",
    towns: [
      "Kalaburagi", "Gulbarga", "Afzalpur", "Aland", "Chincholi",
      "Chittapur", "Jewargi", "Sedam", "Wadi",
    ],
  },
  {
    district: "Bidar",
    towns: ["Bidar", "Aurad", "Basavakalyan", "Bhalki", "Humnabad", "Chitguppa", "Kamalnagar"],
  },
  {
    district: "Chamarajanagar",
    towns: ["Chamarajanagar", "Gundlupet", "Kollegala", "Yelandur", "Hanur"],
  },
];

export const KARNATAKA_TOWN_COUNT = KARNATAKA_AREAS.reduce(
  (sum, d) => sum + d.towns.length,
  0,
);

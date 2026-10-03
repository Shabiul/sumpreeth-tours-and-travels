import type { DestinationView } from "./site";
import type { PackageState } from "./constants";

export type RouteFares = {
  sedanOneWay: number;
  sedanRoundTripDay: number;
  suvOneWay: number;
  suvRoundTripDay: number;
  crystaOneWay: number;
  crystaRoundTripDay: number;
  tempoRoundTripDay: number;
};

export type RouteDetails = {
  highway: string;
  drivingTime: string;
  distanceKm: number;
  bestDepartureTime: string;
  bestSeason: string;
  tollsNote: string;
  statePermitNote: string;
  pitStops: string[];
  fares: RouteFares;
  faqs: { question: string; answer: string }[];
};

export function getRouteDetails(dest: DestinationView): RouteDetails {
  const dist = dest.distanceKm ?? 200;
  const name = dest.name;
  const lower = name.toLowerCase();
  const state = dest.state as PackageState;

  // Calculate realistic distance-based fare approximations
  const sedanOneWay = Math.max(1400, Math.round(dist * 13.5 / 50) * 50);
  const suvOneWay = Math.max(2200, Math.round(dist * 17.5 / 50) * 50);
  const crystaOneWay = Math.max(2600, Math.round(dist * 19.5 / 50) * 50);

  // Round trip daily minimums (300 km/day standard)
  const sedanRoundTripDay = 300 * 12 + 400; // ₹4,000/day
  const suvRoundTripDay = 300 * 17 + 400; // ₹5,500/day
  const crystaRoundTripDay = 300 * 18 + 400; // ₹5,800/day
  const tempoRoundTripDay = 300 * 20 + 500; // ₹6,500/day

  // State-specific border tax regulations
  let statePermitNote = "Zero inter-state tax required (intra-Karnataka route). Only FASTag toll plaza charges apply at actuals.";
  if (state === "TAMIL_NADU") {
    statePermitNote = "Tamil Nadu commercial vehicle entry permit tax is applicable at the border checkpost (paid online/at actuals). FASTag highway tolls extra.";
  } else if (state === "KERALA") {
    statePermitNote = "Kerala Motor Vehicles Department entry tax is collected at the border checkpost (Muthanga / Mananthavady / Walayar). FASTag highway tolls extra.";
  } else if (state === "ANDHRA_PRADESH") {
    statePermitNote = "Andhra Pradesh commercial vehicle border permit applicable (~₹350–₹500 depending on vehicle class). FASTag tolls extra.";
  } else if (state === "GOA") {
    statePermitNote = "Goa state entry permit and municipal border toll applicable upon entering the state. FASTag tolls extra.";
  } else if (state === "PUDUCHERRY") {
    statePermitNote = "Puducherry UT entry permit applicable at border checkpost. FASTag tolls extra.";
  } else if (state === "TELANGANA") {
    statePermitNote = "Telangana border road permit applicable at checkpost. FASTag tolls extra.";
  }

  // Estimated driving time
  let drivingTime = "3.5 to 4 hours";
  if (dist <= 60) drivingTime = "1 to 1.5 hours";
  else if (dist <= 100) drivingTime = "1.5 to 2.5 hours";
  else if (dist <= 160) drivingTime = "2.5 to 3.5 hours";
  else if (dist <= 250) drivingTime = "4 to 5 hours";
  else if (dist <= 350) drivingTime = "5.5 to 7 hours";
  else if (dist <= 480) drivingTime = "7.5 to 9 hours";
  else drivingTime = "9 to 12 hours";

  // Corridor & Highway detection
  let highway = "NH 48 / NH 44 Corridor";
  let pitStops = ["Kamat Upachar", "Paakashala", "Café Coffee Day"];
  let bestDepartureTime = "5:00 AM – 6:30 AM (best to cross Bengaluru city limits before 7:00 AM)";
  let bestSeason = "September to March (pleasant weather and comfortable daytime temperatures)";

  if (
    lower.includes("mysore") ||
    lower.includes("srirangapatna") ||
    lower.includes("mandya") ||
    lower.includes("channapatna") ||
    lower.includes("ramanagara") ||
    lower.includes("coorg") ||
    lower.includes("madikeri") ||
    lower.includes("kushalnagar")
  ) {
    highway = "NH 275 (Bengaluru–Mysuru 10-Lane Access-Controlled Expressway)";
    pitStops = [
      "Kamat Lokaruchi (Ramanagara)",
      "Shivalli Restaurant (Channapatna)",
      "Maddur Tiffanys (Maddur)",
      "Empire Restaurant (Maddur / Mysuru Hwy)",
    ];
    bestDepartureTime = "5:30 AM – 6:30 AM (ensures an empty expressway and early breakfast arrival)";
    bestSeason = lower.includes("coorg") || lower.includes("madikeri")
      ? "October to May for coffee estate trails & waterfalls; July–August for lush monsoon greenery"
      : "Year-round; October to March offers the most pleasant sightseeing conditions";
  } else if (
    lower.includes("chikmagalur") ||
    lower.includes("hassan") ||
    lower.includes("sakleshpur") ||
    lower.includes("belur") ||
    lower.includes("halebeedu") ||
    lower.includes("dharmasthala") ||
    lower.includes("subramanya") ||
    lower.includes("mangalore") ||
    lower.includes("udupi") ||
    lower.includes("sringeri") ||
    lower.includes("shravanabelagola")
  ) {
    highway = "NH 75 (Bengaluru–Mangaluru Highway via Kunigal & Hassan)";
    pitStops = [
      "Swathi Delicacy (Yediyur / Kunigal)",
      "Surabhi Grand (Channarayapatna)",
      "Hotel Mayura (Bellur Cross)",
      "Ocean Pearl (Ujire / Mangaluru)",
    ];
    bestDepartureTime = "5:00 AM – 6:00 AM (smooth exit via Nelamangala tollway before morning lorry traffic)";
    bestSeason = "September to March (cool mountain breezes and clear trekking views in the Western Ghats)";
  } else if (
    lower.includes("hampi") ||
    lower.includes("chitradurga") ||
    lower.includes("davanagere") ||
    lower.includes("hubli") ||
    lower.includes("dharwad") ||
    lower.includes("belgaum") ||
    lower.includes("jog falls") ||
    lower.includes("shivamogga") ||
    lower.includes("dandeli") ||
    lower.includes("badami") ||
    lower.includes("bijapur")
  ) {
    highway = "NH 48 (Bengaluru–Pune Highway via Tumkur & Chitradurga)";
    pitStops = [
      "Paakashala (Sira / Tumkur Bypass)",
      "Kamat Upachar (Dobbaspet)",
      "Ravi Benne Dosa (Davanagere bypass)",
      "Hotel Naveen (Hubli)",
    ];
    bestDepartureTime = "4:30 AM – 5:30 AM (ideal for covering 250+ km before noon)";
    bestSeason = "October to February (heritage ruins and boulder landscapes are pleasant to explore on foot)";
  } else if (
    lower.includes("nandi") ||
    lower.includes("chikkaballapur") ||
    lower.includes("devanahalli") ||
    lower.includes("hyderabad") ||
    lower.includes("mantralaya") ||
    lower.includes("raichur") ||
    lower.includes("lepakshi") ||
    lower.includes("anantapur")
  ) {
    highway = "NH 44 (Bengaluru–Hyderabad National Highway / Airport Expressway)";
    pitStops = [
      "Indian Paratha Company (Devanahalli)",
      "Nandi Upachar (Chikkaballapura Bypass)",
      "Woodys (Bagepalli)",
      "Food Pyramid (Kurnool / NH 44)",
    ];
    bestDepartureTime = "4:00 AM – 5:00 AM for Nandi Hills sunrise; 5:00 AM – 6:00 AM for longer outstation drives";
    bestSeason = "September to February (cool mornings and comfortable highway driving)";
  } else if (
    lower.includes("ooty") ||
    lower.includes("kodaikanal") ||
    lower.includes("chennai") ||
    lower.includes("trichy") ||
    lower.includes("madurai") ||
    lower.includes("kanyakumari") ||
    lower.includes("pondicherry") ||
    lower.includes("salem") ||
    lower.includes("coimbatore")
  ) {
    highway = "NH 44 / AH 43 (Bengaluru–Salem–Madurai Corridor via Electronic City & Hosur)";
    pitStops = [
      "Adyar Ananda Bhavan / A2B (Hosur & Dharmapuri)",
      "Saravana Bhavan (Salem Bypass)",
      "Murugan Idli Shop (Krishnagiri)",
      "Sree Saravana Bhavan (Dindigul)",
    ];
    bestDepartureTime = "5:00 AM – 5:45 AM (skip the Electronic City / Attibele border congestion)";
    bestSeason = lower.includes("ooty") || lower.includes("kodaikanal")
      ? "March to June for summer retreat; October to February for misty winter hill weather"
      : "October to March (pleasant coastal and temple tour conditions)";
  } else if (
    lower.includes("tirupati") ||
    lower.includes("kolar") ||
    lower.includes("kgf")
  ) {
    highway = "NH 75 & NH 69 (Bengaluru–Tirupati Highway via Kolar, Mulbagal & Chittoor)";
    pitStops = [
      "Woodys (Kolar Bypass)",
      "Maiyas (Kolar Highway)",
      "Bans The Hotel (Chittoor)",
      "Adyar Ananda Bhavan (Mulbagal)",
    ];
    bestDepartureTime = "4:00 AM – 5:00 AM (ensures timely arrival for morning/afternoon Tirumala darshan slots)";
    bestSeason = "September to March (comfortable queues and cooler hill weather atop Tirumala)";
  } else if (
    lower.includes("wayanad") ||
    lower.includes("munnar") ||
    lower.includes("alleppey") ||
    lower.includes("trivandrum")
  ) {
    highway = lower.includes("wayanad")
      ? "NH 766 via Mysuru Expressway & Bandipur Tiger Reserve"
      : "NH 44 & NH 544 via Salem, Coimbatore & Kochi";
    pitStops = [
      "Café County (Gundlupet)",
      "Empire Restaurant (Mysuru Road)",
      "Saravana Bhavan (Coimbatore Bypass)",
    ];
    bestDepartureTime = "5:00 AM – 5:45 AM (Bandipur forest checkpost operates 6:00 AM to 9:00 PM)";
    bestSeason = "September to May (scenic waterfalls, tea gardens and misty ghat passes)";
  } else if (
    lower.includes("gokarna") ||
    lower.includes("goa") ||
    lower.includes("karwar") ||
    lower.includes("murudeshwar") ||
    lower.includes("bhatkal")
  ) {
    highway = "NH 48 to Hubli/Shimoga, connecting to NH 66 Coastal Highway";
    pitStops = [
      "Paakashala (Sira)",
      "Kamat Upachar (Ranebennur bypass)",
      "Hotel Ocean View (Murudeshwar)",
    ];
    bestDepartureTime = "4:30 AM – 5:30 AM (ideal for an early afternoon beachside arrival)";
    bestSeason = "October to April (warm sunny beach days and calm seas for water sports)";
  }

  const faqs = [
    {
      question: `What is the cab fare from Bangalore to ${name}?`,
      answer: `Cab fares from Bangalore to ${name} depend on vehicle choice and trip type. A one-way drop taxi in a sedan (Toyota Etios / Swift Dzire) starts at approximately ₹${sedanOneWay.toLocaleString("en-IN")}, while a spacious SUV (Maruti Ertiga / Toyota Innova) starts at ₹${suvOneWay.toLocaleString("en-IN")}. For round trips, billing is on a per-km basis starting from ₹12/km for sedans and ₹17–₹18/km for SUVs, with a standard minimum of 300 km/day and nominal driver bata. Tolls and parking are charged at actuals.`,
    },
    {
      question: `How far is ${name} from Bangalore and how long does the drive take?`,
      answer: `${name} is approximately ${dist} km from Bengaluru. By private cab, the journey takes about ${drivingTime} via ${highway}, depending on departure time and city traffic. We recommend starting early between ${bestDepartureTime} for an uninterrupted drive.`,
    },
    {
      question: `Which is the best highway route to reach ${name} from Bangalore?`,
      answer: `The primary and most comfortable route is via ${highway}. This highway offers well-maintained asphalt stretches, clear signage, multiple fuel stations, and popular family refreshment stops such as ${pitStops.slice(0, 3).join(", ")}.`,
    },
    {
      question: `Can I book a one-way taxi from Bangalore to ${name}?`,
      answer: `Yes, Sumpreeth Tours and Travels provides dedicated one-way drop cabs to ${name}. You pay only for the distance travelled to ${name} with zero return fare charges. Doorstep pickup across all Bangalore localities and airport transfers are available 24/7.`,
    },
    {
      question: `Are highway FASTag tolls and state border permits included?`,
      answer: `Vehicle rental, driver allowance (bata), and fuel are fully included in the quoted fare. ${statePermitNote} All toll receipts are transparently accounted for via electronic FASTag logs with zero hidden markups.`,
    },
    {
      question: `What vehicle options are available for a family trip to ${name}?`,
      answer: `We offer comfortable 4+1 sedans (Toyota Etios, Swift Dzire) for 1–4 passengers, 6+1 and 7+1 SUVs (Maruti Ertiga, Toyota Innova, Innova Crysta) for family luggage, and luxury 12-seater / 16-seater Force Tempo Travellers or Force Urbania vans for large groups and temple tours.`,
    },
  ];

  return {
    highway,
    drivingTime,
    distanceKm: dist,
    bestDepartureTime,
    bestSeason,
    tollsNote: "FASTag automated tolls applicable at actuals",
    statePermitNote,
    pitStops,
    fares: {
      sedanOneWay,
      sedanRoundTripDay,
      suvOneWay,
      suvRoundTripDay,
      crystaOneWay,
      crystaRoundTripDay,
      tempoRoundTripDay,
    },
    faqs,
  };
}

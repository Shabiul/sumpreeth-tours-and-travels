/**
 * Neighbouring-state one-way route coverage (Tier 3 pattern, same rationale
 * as karnataka-areas.ts): one honest service-area declaration grouped by
 * real corridor/region, not hundreds of near-duplicate per-town pages — a
 * doorway-page pattern Google penalizes. Towns are grouped by the actual
 * highway corridor Sumpreeth's one-way routes run (NH44/NH544 south from
 * Bengaluru), not fabricated per-town fare/distance data.
 */
export type StateCoverage = {
  state: string;
  areas: { region: string; towns: string[] }[];
};

export const INTERSTATE_AREAS: StateCoverage[] = [
  {
    state: "Tamil Nadu",
    areas: [
      {
        region: "Krishnagiri & Dharmapuri belt",
        towns: ["Hosur", "Krishnagiri", "Dharmapuri", "Tiruvannamalai"],
      },
      {
        region: "Vellore belt",
        towns: ["Vaniyambadi", "Ambur", "Katpadi", "Gudiyattam", "Tirupattur", "Arni"],
      },
      {
        region: "Chennai & Kanchipuram belt",
        towns: ["Kanchipuram", "Chennai", "Mahabalipuram", "Chengalpattu"],
      },
      {
        region: "Villupuram, Cuddalore & Puducherry belt",
        towns: ["Tindivanam", "Kallakurichi", "Villupuram", "Cuddalore", "Pondicherry", "Chidambaram", "Sirkali"],
      },
      {
        region: "Thanjavur delta",
        towns: ["Karaikudi", "Karaikal", "Nagapattinam", "Thanjavur", "Kumbakonam", "Mannargudi", "Pattukottai", "Thiruvarur", "Pudukkottai"],
      },
      {
        region: "Trichy & Namakkal belt",
        towns: ["Thuraiyur", "Namakkal", "Trichy", "Karur"],
      },
      {
        region: "Madurai & Ramanathapuram belt",
        towns: ["Madurai", "Ramanathapuram", "Rameswaram", "Sivakasi", "Devakottai", "Paramakudi", "Aruppukottai", "Virudhunagar", "Rajapalayam"],
      },
      {
        region: "Tirunelveli & Kanyakumari belt",
        towns: ["Tirunelveli", "Thoothukudi", "Tenkasi", "Tiruchendur", "Nagercoil", "Kanyakumari"],
      },
      {
        region: "Theni, Dindigul & Palani belt",
        towns: ["Theni", "Dindigul", "Palani", "Dharapuram", "Kangeyam", "Paramathi Velur"],
      },
      {
        region: "Erode & Coimbatore belt",
        towns: ["Erode", "Tirupur", "Pollachi", "Udumalaipettai", "Coimbatore", "Avinashi", "Anthiyur", "Annur", "Sathyamangalam", "Bhavani", "Sankagiri", "Tiruchengode", "Mettur", "Gobichettipalayam", "Omalur"],
      },
      {
        region: "Nilgiris & Palani hills",
        towns: ["Ooty", "Kodaikanal"],
      },
    ],
  },
  {
    state: "Kerala",
    areas: [
      {
        region: "Malabar belt",
        towns: ["Kasaragod", "Kannur", "Thalassery", "Wayanad"],
      },
      {
        region: "Central Kerala",
        towns: ["Palakkad", "Malappuram", "Thrissur", "Guruvayur", "Ernakulam", "Kochi", "Kottayam", "Munnar", "Thekkady"],
      },
      {
        region: "South Kerala",
        towns: ["Sabarimala", "Alappuzha", "Trivandrum"],
      },
    ],
  },
  {
    state: "Andhra Pradesh & Telangana",
    areas: [
      {
        region: "Rayalaseema belt",
        towns: ["Anantapur", "Gooty", "Dharmavaram", "Penukonda", "Kadiri", "Kadapa", "Rayachoti", "Madanapalle", "Punganur", "Palamaner"],
      },
      {
        region: "Chittoor & Tirupati belt",
        towns: ["Chittoor", "Tirupati", "Srikalahasti", "Venkatagirikota"],
      },
      {
        region: "Coastal Andhra",
        towns: ["Nellore", "Kavali", "Ongole", "Vijayawada", "Rajahmundry", "Visakhapatnam"],
      },
      {
        region: "Telangana",
        towns: ["Hyderabad", "Mahabubnagar", "Khammam"],
      },
      {
        region: "Kurnool & Srisailam belt",
        towns: ["Kurnool", "Srisailam"],
      },
    ],
  },
];

export const INTERSTATE_TOWN_COUNT = INTERSTATE_AREAS.reduce(
  (sum, s) => sum + s.areas.reduce((n, a) => n + a.towns.length, 0),
  0,
);

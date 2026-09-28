/**
 * Major Indian cities/towns nationwide, for the pickup/drop autocomplete only —
 * a typing convenience, not a service-area claim (see karnataka-areas.ts /
 * interstate-areas.ts for the towns Sumpreeth actually declares as coverage).
 * One representative list per state/UT: the capital plus other well-known
 * cities, so a customer typing from anywhere in India gets a real suggestion.
 */
export const INDIA_CITIES: string[] = [
  // North
  "Delhi", "New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad",
  "Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala",
  "Shimla", "Manali", "Dharamshala", "Kullu",
  "Jammu", "Srinagar", "Gulmarg", "Pahalgam", "Leh",
  "Dehradun", "Rishikesh", "Haridwar", "Mussoorie", "Nainital",
  "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Ayodhya", "Mathura", "Meerut", "Noida", "Gorakhpur", "Bareilly", "Aligarh",
  "Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Bikaner", "Ajmer", "Pushkar", "Kota", "Mount Abu",

  // West
  "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Solapur", "Thane", "Navi Mumbai", "Lonavala", "Mahabaleshwar", "Shirdi",
  "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Dwarka", "Somnath", "Bhavnagar",
  "Panaji", "Margao", "Vasco da Gama", "Calangute",
  "Silvassa", "Daman",

  // Central
  "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Khajuraho", "Pachmarhi",
  "Raipur", "Bilaspur (Chhattisgarh)",

  // East
  "Kolkata", "Howrah", "Siliguri", "Darjeeling", "Digha", "Durgapur", "Asansol",
  "Patna", "Gaya", "Bodh Gaya", "Muzaffarpur", "Darbhanga", "Bhagalpur",
  "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro",
  "Bhubaneswar", "Puri", "Cuttack", "Konark", "Rourkela",

  // Northeast
  "Guwahati", "Dibrugarh", "Jorhat", "Silchar", "Tezpur",
  "Shillong", "Cherrapunji",
  "Imphal", "Agartala", "Aizawl", "Kohima", "Itanagar", "Gangtok",

  // Additional major North/West towns rounding out state coverage
  "Chittorgarh", "Bharatpur", "Alwar", "Sikar",
  "Rewa", "Satna", "Sagar (MP)",
  "Nanded", "Amravati", "Akola", "Latur",
  "Junagadh", "Porbandar", "Bhuj",
];

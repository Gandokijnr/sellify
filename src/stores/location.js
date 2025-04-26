// locations.js

// Nigerian states and their local governments with locations
const nigeriaLocations = {
  Abia: {
    "Aba North": ["Ariaria", "Ogbor Hill", "Eziama", "Uratta"],
    "Aba South": ["Aba Town", "Aba GRA", "Umungasi", "Ehere"],
    "Umuahia North": ["Umuahia", "Ibeku", "Afara", "Ossah"],
  },
  "Abuja FCT": {
    "Abuja Municipal": [
      "Garki",
      "Wuse",
      "Maitama",
      "Asokoro",
      "Gwarinpa",
      "Utako",
    ],
    Bwari: ["Bwari Town", "Kubwa", "Ushafa", "Dutse"],
    Gwagwalada: ["Gwagwalada Town", "Zuba", "Ibwa", "Dobi"],
  },
  Adamawa: {
    "Yola North": ["Jimeta", "Jambutu", "Karewa", "Luggere"],
    "Yola South": ["Yola Town", "Mbamba", "Adarawo", "Ngurore"],
  },
  "Akwa Ibom": {
    Uyo: ["Uyo Town", "Ewet Housing", "Shelter Afrique", "Ikot Ekpene Road"],
    "Ikot Ekpene": [
      "Ikot Ekpene Town",
      "Ikot Obong Edong",
      "Uruk Uso",
      "Ikot Ntuen",
    ],
  },
  Anambra: {
    "Awka South": ["Awka", "Amawbia", "Nibo", "Umuokpu"],
    "Onitsha North": [
      "Onitsha GRA",
      "Inland Town",
      "American Quarters",
      "Odoakpu",
    ],
    "Onitsha South": ["Fegge", "Woliwo", "Okpoko", "Aba Park"],
  },
  Bauchi: {
    Bauchi: ["Bauchi GRA", "Fadaman Mada", "Wunti", "Gudun"],
  },
  Bayelsa: {
    Yenagoa: ["Yenagoa Town", "Amarata", "Ovom", "Igbogene"],
  },
  Benue: {
    Makurdi: ["Makurdi Town", "North Bank", "High Level", "Wurukum"],
  },
  Borno: {
    Maiduguri: ["Maiduguri GRA", "Gwange", "Bulunkutu", "Gamboru"],
  },
  "Cross River": {
    "Calabar Municipal": [
      "Calabar South",
      "Calabar GRA",
      "Big Qua",
      "State Housing",
    ],
  },
  Delta: {
    "Warri South": ["Warri GRA", "Okumagba Layout", "Airport Road", "Ubeji"],
    Asaba: ["Asaba GRA", "Okwe", "Cable Point", "Ibusa Road"],
  },
  Ebonyi: {
    Abakaliki: ["Abakaliki Town", "Kpirikpiri", "Abakpa", "Azuiyiokwu"],
  },
  Edo: {
    "Benin City": ["GRA", "Ugbowo", "Aduwawa", "Sapele Road", "Airport Road"],
  },
  Ekiti: {
    "Ado Ekiti": ["Ado Ekiti GRA", "Ajilosun", "Basiri", "Adebayo"],
  },
  Enugu: {
    "Enugu North": ["Enugu GRA", "New Haven", "Independence Layout", "Ogui"],
    "Enugu South": ["Achara Layout", "Uwani", "Maryland", "Awkunanaw"],
  },
  Gombe: {
    Gombe: ["Gombe GRA", "Federal Low-cost", "Checheniya", "Pantami"],
  },
  Imo: {
    "Owerri Municipal": ["Owerri GRA", "Ikenegbu", "Aladinma", "New Owerri"],
  },
  Jigawa: {
    Dutse: ["Dutse GRA", "Takur Site", "Fagoji", "Danmasara"],
  },
  Kaduna: {
    "Kaduna North": ["Kaduna GRA", "Unguwan Rimi", "Malali", "Kabala Costain"],
    "Kaduna South": ["Barnawa", "Television", "Sabon Tasha", "Narayi"],
  },
  Kano: {
    "Kano Municipal": ["Kano GRA", "Nasarawa", "Fagge", "Sabon Gari"],
  },
  Katsina: {
    Katsina: ["Katsina GRA", "Kofar Kaura", "Kofar Kwaya", "Layout"],
  },
  Kebbi: {
    "Birnin Kebbi": ["Birnin Kebbi GRA", "Badariya", "Nassarawa", "Tudun Wada"],
  },
  Kogi: {
    Lokoja: ["Lokoja GRA", "Adankolo", "Felele", "Ganaja"],
  },
  Kwara: {
    Ilorin: ["Ilorin GRA", "Adewole", "Tanke", "Gaa Akanbi"],
  },
  Lagos: {
    Ikeja: [
      "Ikeja GRA",
      "Allen Avenue",
      "Oregun",
      "Opebi",
      "Maryland",
      "Alausa",
    ],
    "Lagos Island": [
      "Lagos Island",
      "Ikoyi",
      "Victoria Island",
      "Lekki Phase 1",
      "Ajah",
    ],
    Alimosho: ["Ikotun", "Egbeda", "Iyana Ipaja", "Idimu", "Ayobo"],
    Surulere: ["Surulere", "Aguda", "Ijeshatedo", "Ojuelegba", "Itire"],
    "Eti-Osa": ["Lekki", "Victoria Island", "Ikoyi", "Ajah", "Sangotedo"],
    Kosofe: ["Ojota", "Ogudu", "Ketu", "Mile 12", "Magodo"],
    Mushin: ["Mushin", "Idi-Araba", "Papa Ajao", "Ladipo", "Isolo"],
  },
  Nasarawa: {
    Lafia: [
      "Lafia GRA",
      "Millionaires Quarters",
      "Bukan Sidi",
      "Tudun Gwandara",
    ],
  },
  Niger: {
    Minna: ["Minna GRA", "Tunga", "Bosso", "Maitumbi"],
  },
  Ogun: {
    "Abeokuta South": ["Abeokuta GRA", "Ibara", "Oke Ilewo", "Kuto"],
    "Ado-Odo/Ota": ["Ota", "Sango", "Ijoko", "Iju"],
  },
  Ondo: {
    "Akure South": ["Akure GRA", "Alagbaka", "Oba Ile", "Ijapo"],
  },
  Osun: {
    Osogbo: ["Osogbo GRA", "Alekuwodo", "Okefia", "Oke Baale"],
  },
  Oyo: {
    "Ibadan North": ["Bodija", "Agodi GRA", "Ikolaba", "Sango"],
    "Ibadan South-West": ["Ring Road", "Challenge", "Oluyole", "Oke Ado"],
  },
  Plateau: {
    "Jos North": ["Jos GRA", "Terminus", "Apata", "Jenta"],
  },
  Rivers: {
    "Port Harcourt": [
      "Port Harcourt GRA",
      "D-Line",
      "Old GRA",
      "Rumuola",
      "Rumuokwuta",
    ],
    "Obio/Akpor": [
      "Rumuigbo",
      "Rumuokoro",
      "Rumuodara",
      "Woji",
      "Rumuokwurusi",
    ],
  },
  Sokoto: {
    "Sokoto North": ["Sokoto GRA", "Gawon Nama", "Arkilla", "Runjin Sambo"],
  },
  Taraba: {
    Jalingo: ["Jalingo GRA", "Sabon Gari", "Kona", "Mayo Gwoi"],
  },
  Yobe: {
    Damaturu: ["Damaturu GRA", "Nayi Nawa", "Pawari", "Abasha"],
  },
  Zamfara: {
    Gusau: ["Gusau GRA", "Tudun Wada", "Sabon Gari", "Samaru"],
  },
};

export default nigeriaLocations;

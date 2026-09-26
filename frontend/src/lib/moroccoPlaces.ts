export const MOROCCO_REGION_CITIES: { region: string; cities: string[] }[] = [
  { region: "Tanger-Tétouan-Al Hoceïma", cities: ["Tanger", "Tétouan", "Al Hoceïma", "Chefchaouen", "Larache", "Ksar El Kebir"] },
  { region: "Oriental", cities: ["Oujda", "Nador", "Berkane", "Taourirt", "Jerada", "Figuig"] },
  { region: "Fès-Meknès", cities: ["Fès", "Meknès", "Taza", "Ifrane", "Sefrou", "Azrou"] },
  { region: "Rabat-Salé-Kénitra", cities: ["Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Khémisset"] },
  { region: "Béni Mellal-Khénifra", cities: ["Béni Mellal", "Khénifra", "Khouribga", "Fquih Ben Salah", "Azilal"] },
  { region: "Casablanca-Settat", cities: ["Casablanca", "Mohammédia", "Settat", "El Jadida", "Berrechid", "Benslimane"] },
  { region: "Marrakech-Safi", cities: ["Marrakech", "Safi", "Essaouira", "El Kelaa des Sraghna", "Youssoufia", "Chichaoua"] },
  { region: "Drâa-Tafilalet", cities: ["Errachidia", "Ouarzazate", "Zagora", "Tinghir", "Midelt"] },
  { region: "Souss-Massa", cities: ["Agadir", "Inezgane", "Taroudant", "Tiznit", "Ouled Teima"] },
  { region: "Guelmim-Oued Noun", cities: ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa"] },
  { region: "Laâyoune-Sakia El Hamra", cities: ["Laâyoune", "Boujdour", "Tarfaya", "Es-Semara"] },
  { region: "Dakhla-Oued Ed-Dahab", cities: ["Dakhla", "Aousserd"] },
];

export const allMoroccoCities = () =>
  MOROCCO_REGION_CITIES.flatMap((item) => item.cities);

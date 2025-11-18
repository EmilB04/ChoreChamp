export type CountryCodeOption = {
  code: string;
  country: string;
  flag: string;
};

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+47', country: 'Norge',         flag: '🇳🇴' },
  { code: '+44', country: 'Storbritannia', flag: '🇬🇧' },
  { code: '+34', country: 'Spania',        flag: '🇪🇸' },
  { code: '+49', country: 'Tyskland',      flag: '🇩🇪' },
];

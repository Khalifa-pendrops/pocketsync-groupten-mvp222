export const SUPPORTED_INSTITUTIONS = [
  'GTBank',
  'Access Bank',
  'Kuda',
  'Opay',
  'Moniepoint',
] as const;

export type InstitutionName = (typeof SUPPORTED_INSTITUTIONS)[number];
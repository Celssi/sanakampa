export interface ProcessPackage {
  type: 'minimum' | 'minimum-specific' | 'normal';
  words?: string[];
  wantedChange?: string;
  searchPhrase?: string;
}

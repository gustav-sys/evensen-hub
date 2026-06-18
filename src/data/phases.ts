export interface Phase {
  id: string;
  number: number;
  title: string;
  items: string[];
}

export const initialPhases: Phase[] = [
  { id: 'fase-1', number: 1, title: 'Forberedelse', items: ['Strategi & identitet', 'Design & konsepter', 'Produktutvikling', 'Butikkonsepter'] },
  { id: 'fase-2', number: 2, title: 'Produksjon & Bygg', items: ['Produksjon (produkt & emballasje)', 'Butikkoppussing & bygg', 'Nettsideutvikling', 'Innholdsproduksjon'] },
  { id: 'fase-3', number: 3, title: 'Teaser', items: ['Teaser kampanje', 'Historie i fokus', 'Community building', 'PR forberedelser'] },
  { id: 'fase-4', number: 4, title: 'Launch', items: ['Lansering Evensen 1916', 'Butikkåpning CC Vest', 'Hero film lansering', 'Press & events'] },
  { id: 'fase-5', number: 5, title: 'Etterlansering', items: ['Produktlanseringer', 'Innholdsserie', 'Kundelojalitet', 'Internasjonal vekst'] },
];

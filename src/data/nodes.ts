import type { NodeData } from '../types';

const makeDeliverables = (titles: string[]) =>
  titles.map((title, i) => ({
    id: `d-${Math.random().toString(36).slice(2)}-${i}`,
    title,
    status: 'not-started' as const,
    assignee: '',
    comments: [],
  }));

export const initialNodes: NodeData[] = [
  {
    id: 'brand-foundation',
    title: 'Brand Foundation',
    shortLabel: 'Brand Foundation',
    color: '#C8B89A',
    icon: 'BookOpen',
    deliverables: makeDeliverables([
      'Brand strategy & positioning',
      'Logo & symbol',
      'Typography',
      'Color palette',
      'Brand book / Guidelines',
    ]),
  },
  {
    id: 'product',
    title: 'Product',
    shortLabel: 'Product',
    color: '#8B6E52',
    icon: 'Shoe',
    deliverables: makeDeliverables([
      'Pensko',
      'Loafers',
      'Sneakers',
      'Sesongkoleksjoner',
    ]),
  },
  {
    id: 'packaging',
    title: 'Packaging',
    shortLabel: 'Packaging',
    color: '#7C8A5E',
    icon: 'Box',
    deliverables: makeDeliverables([
      'Skoboks',
      'Dust bag',
      'Hangtag',
      'Care card / Historiekort',
    ]),
  },
  {
    id: 'retail',
    title: 'Retail',
    shortLabel: 'Retail',
    color: '#B5714A',
    icon: 'Store',
    deliverables: makeDeliverables([
      'Oppussing av eksisterende butikk',
      'Fasade / Skilt',
      'Vinduskonsept',
      'Interior & materialer',
    ]),
  },
  {
    id: 'digital',
    title: 'Digital',
    shortLabel: 'Digital',
    color: '#3D5A73',
    icon: 'Monitor',
    deliverables: makeDeliverables([
      'Ny visuell identitet',
      'Forside / Landingssider',
      'Tema & design (Shopify)',
      'Checkout & betalingsflyt',
    ]),
  },
  {
    id: 'social-media',
    title: 'Social Media & Content',
    shortLabel: 'Social',
    color: '#5C6B3E',
    icon: 'Share2',
    deliverables: makeDeliverables([
      'Teaser innhold',
      'Historiefilm',
      'Founder story',
      'UGC & ambassadører',
    ]),
  },
  {
    id: 'email',
    title: 'Email Marketing',
    shortLabel: 'Email',
    color: '#6B3E3E',
    icon: 'Mail',
    deliverables: makeDeliverables([
      'Vi endrer navn (teaser)',
      'Historien bak Evensen 1916',
      'Lansering',
      'Produktnyheter',
    ]),
  },
  {
    id: 'pr',
    title: 'PR & Communications',
    shortLabel: 'PR',
    color: '#7A7268',
    icon: 'Newspaper',
    deliverables: makeDeliverables([
      'Pressemelding',
      'Pressebilder',
      'Pressekit',
      'Founder intervju',
    ]),
  },
  {
    id: 'events',
    title: 'Events & Experiences',
    shortLabel: 'Events',
    color: '#6B7A5C',
    icon: 'Star',
    deliverables: makeDeliverables([
      'VIP launch event',
      'Kundekveld',
      'Preview event',
      'Community events',
    ]),
  },
];

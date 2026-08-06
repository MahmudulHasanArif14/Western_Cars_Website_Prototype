export interface ServicesMenuSection {
  title: string;
  items: {
    label: string;
    href: string;
  }[];
}

export const servicesMenu: ServicesMenuSection[] = [
  {
    title: "Business Services",
    items: [
      { label: "Open Account", href: "/business/open-account" },
      { label: "Business Accounts", href: "/business/accounts" },
      { label: "Travel Management Tool", href: "/business/travel-management" },
      { label: "Commercial Partnership", href: "/business/partnership" },
    ],
  },
  {
    title: "Passenger Services",
    items: [
      { label: "All Services", href: "/services" },
      { label: "A to B Transfers", href: "/services/a-to-b" },
      { label: "Airport Transfers", href: "/services/airport-transfers" },
      {
        label: "National / International",
        href: "/services/national-international",
      },
      { label: "Download the App", href: "/download-app" },
    ],
  },
];

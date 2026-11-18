export const BUSINESS_HOURS = {
  label: "Monday–Saturday, 10am–10pm; Sunday, 11am–8pm",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "https://schema.org/Monday",
        "https://schema.org/Tuesday",
        "https://schema.org/Wednesday",
        "https://schema.org/Thursday",
        "https://schema.org/Friday",
        "https://schema.org/Saturday",
      ],
      opens: "10:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "https://schema.org/Sunday",
      opens: "11:00",
      closes: "20:00",
    },
  ],
} as const;

export const BUSINESS_CONTACT = {
  whatsapp: "059 175 4764",
  whatsappInternational: "+233591754764",
  whatsappUsername: "richdonscatering",
  phones: ["0550103277", "0591754764"],
} as const;

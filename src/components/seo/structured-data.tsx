import Script from 'next/script'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SMS - Strangers Meeting Strangers',
  alternateName: 'SMS',
  url: 'https://strangersmeetingstrangers.com',
  logo: 'https://strangersmeetingstrangers.com/og-image.png',
  description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
  foundingDate: '2023',
  founder: {
    '@type': 'Person',
    name: 'Liban Kano',
  },
  sameAs: [
    'https://www.instagram.com/strangersmeetingstrangers',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'hello@strangersmeetingstrangers.com',
    availableLanguage: 'English',
  },
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://strangersmeetingstrangers.com/#localbusiness',
  name: 'SMS - Strangers Meeting Strangers',
  image: 'https://strangersmeetingstrangers.com/og-image.png',
  description: 'Social connection events where strangers meet with intention.',
  url: 'https://strangersmeetingstrangers.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Minneapolis',
    addressRegion: 'MN',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 44.9778,
    longitude: -93.2650,
  },
  areaServed: {
    '@type': 'City',
    name: 'Minneapolis',
  },
  priceRange: '$$',
  email: 'hello@strangersmeetingstrangers.com',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
      opens: '18:00',
      closes: '23:00',
    },
  ],
}

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SMS - Strangers Meeting Strangers',
  url: 'https://strangersmeetingstrangers.com',
  description: 'Infrastructure for human connection. Rooms where strangers meet with intention.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://strangersmeetingstrangers.com/discover?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export function StructuredData() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(organizationSchema)}
      </Script>
      <Script
        id="local-business-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(localBusinessSchema)}
      </Script>
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(webSiteSchema)}
      </Script>
    </>
  )
}

interface EventSchemaProps {
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  url: string
  price?: number
  capacity?: number
}

export function EventSchema({ name, description, startDate, endDate, location, url, price, capacity }: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SocialEvent',
    name,
    description,
    startDate,
    endDate,
    location: {
      '@type': 'Place',
      name: location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Minneapolis',
        addressRegion: 'MN',
        addressCountry: 'US',
      },
    },
    url,
    organizer: {
      '@type': 'Organization',
      name: 'SMS - Strangers Meeting Strangers',
      url: 'https://strangersmeetingstrangers.com',
    },
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(price !== undefined && {
      offers: {
        '@type': 'Offer',
        price: price / 100,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url,
      },
    }),
    ...(capacity && {
      maximumAttendeeCapacity: capacity,
    }),
  }

  return (
    <Script
      id={`event-schema-${url}`}
      type="application/ld+json"
      strategy="afterInteractive"
    >
      {JSON.stringify(schema)}
    </Script>
  )
}

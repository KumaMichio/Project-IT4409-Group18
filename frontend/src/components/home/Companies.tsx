'use client';

export function Companies() {
  const companies = [
    { name: 'Google', logo: 'mdi:google' },
    { name: 'HubSpot', logo: 'mdi:code-tags' },
    { name: 'Microsoft', logo: 'mdi:microsoft' },
    { name: 'Walmart', logo: 'mdi:store' },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-2xl font-bold text-center text-midnight-text mb-8">
          Trusted By Companies Of All Sizes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-3xl font-bold text-gray-400">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


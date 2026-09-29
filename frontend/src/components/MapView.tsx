const ANFA_PLACE = { lat: 33.59806, lng: -7.66694 };

const MapView = () => {
  const { lat, lng } = ANFA_PLACE;
  const pad = 0.012;
  const bbox = `${lng - pad},${lat - pad},${lng + pad},${lat + pad}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white">
      <iframe
        title="Anfa Place Mall, Casablanca"
        src={src}
        className="h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="border-t border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-800">
        Anfa Place Mall, Casablanca
      </p>
    </div>
  );
};

export default MapView;

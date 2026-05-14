const colorBarSegments = [
  '#6b0033',
  '#b50232',
  '#dc0037',
  '#ec4561',
  '#f93f24',
  '#ff780f',
  '#ffa500',
  '#ff6b9d',
  '#e91e63',
  '#c2185b',
  '#7b1fa2',
];

export default function Footer() {
  return (
    <footer className="shrink-0 bg-white">
      <div className="px-4 pb-1 pt-1.5 text-center text-[10px] leading-[1.35] text-[#6b7280]">
        <p>
          Absa Bank Kenya PLC. Registered in Kenya. Registered office: Absa Head Quarters, Waiyaki Way, PO Box 30120, 00100
          GPO, Nairobi, Kenya.
        </p>
        <p>Absa Bank Kenya PLC is regulated by the Central Bank of Kenya.</p>
      </div>
      <div className="flex h-[6px] w-full gap-[1px] bg-white">
        {colorBarSegments.map((color, index) => (
          <div key={index} className="flex-1" style={{ backgroundColor: color }} aria-hidden />
        ))}
      </div>
    </footer>
  );
}

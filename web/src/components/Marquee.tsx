const items = [
  { emoji: "🥥", text: "SPLIT BILLS" },
  { emoji: "💸", text: "SEND MONEY" },
  { emoji: "🛒", text: "GROUP BUY" },
  { emoji: "⚡", text: "INSTANT" },
  { emoji: "🔥", text: "NO FEES" },
];

export function Marquee() {
  const doubledItems = [...items, ...items];

  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {doubledItems.map((item, i) => (
          <div key={i} className="marquee-item">
            <span>{item.emoji}</span> {item.text} <span>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

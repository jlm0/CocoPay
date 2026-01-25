const words = ["SEND", "SPLIT", "STACK", "SAVE"];

export function ChaosStrip() {
  const repeatedWords = [...words, ...words, ...words];

  return (
    <div className="chaos-strip">
      <div className="chaos-content">
        {repeatedWords.map((word, i) => (
          <span key={i} className="chaos-word">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

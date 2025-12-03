import { useEffect, useState } from "react";
import { getSuggestions } from "../api/suggestions";

export default function SuggestionPanel({ gameState }) {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!gameState) return;

    getSuggestions(gameState).then((data) => {
      setSuggestions(data.suggestions);
    });

  }, [gameState]);

  return (
    <div className="panel">
      <h3>Sugerencias de jugada</h3>

      {suggestions.map((s, i) => (
        <div key={i} className="sugg">
          <strong>Ficha:</strong> {s.piece_id}  
          <br />
          <strong>De:</strong> {s.from} → <strong>A:</strong> {s.to}
          <br />
          <strong>Puntuación:</strong> {s.score}
          <br />
          <em>{s.reason}</em>
        </div>
      ))}
    </div>
  );
}

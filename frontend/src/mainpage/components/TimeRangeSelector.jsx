import React from "react";
import "./timeRangeSelector.css";

export default function TimeRangeSelector({ ranges, value, onChange, disabled = {} }) {
  return (
    <div className="range-bar">
      {ranges.map(r => (
        <button
          key={r.days}
          className={"range-btn" + (value === r.days ? " active" : "")}
          disabled={disabled[r.days]}
          onClick={() => onChange(r.days)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

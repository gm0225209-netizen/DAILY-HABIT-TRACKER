/*
  MODULE: ChainStrip.jsx
  ------------------------
  THE SIGNATURE ELEMENT of the whole design. Instead of a generic
  progress bar, each habit's recent history renders as a literal chain:
  a solid forged link for every day completed, a snapped/dashed link
  for a missed day, and a glowing amber link for today. Clicking a link
  toggles that day — the chain IS the interaction, not just a display.

  Props:
    days: [{ date: "2026-08-18", done: bool, isToday: bool }]
    onToggle(date): called when a link is clicked
*/

export default function ChainStrip({ days, onToggle }) {
  return (
    <svg
      viewBox={`0 0 ${days.length * 34} 40`}
      width="100%"
      height="40"
      role="group"
      aria-label="Streak chain, one link per day"
    >
      {days.map((day, i) => {
        const cx = i * 34 + 17;
        const color = day.isToday
          ? "var(--link-today)"
          : day.done
          ? "var(--link-done)"
          : "var(--link-broken)";

        return (
          <g
            key={day.date}
            onClick={() => onToggle(day.date)}
            style={{ cursor: "pointer" }}
            tabIndex={0}
            role="button"
            aria-pressed={day.done}
            aria-label={`${day.date}: ${day.done ? "done" : "not done"}`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle(day.date)}
          >
            {/* connecting line to the next link */}
            {i < days.length - 1 && (
              <line
                x1={cx + 10}
                y1={20}
                x2={cx + 24}
                y2={20}
                stroke="var(--ink-700)"
                strokeWidth={2}
              />
            )}
            {day.done || day.isToday ? (
              <rect
                x={cx - 9}
                y={9}
                width={18}
                height={22}
                rx={9}
                fill="none"
                stroke={color}
                strokeWidth={4}
              />
            ) : (
              /* snapped link: two short offset arcs instead of a closed ring */
              <>
                <path d={`M ${cx - 9} 20 A 9 9 0 0 1 ${cx - 2} 10`} stroke={color} strokeWidth={4} fill="none" />
                <path d={`M ${cx + 2} 30 A 9 9 0 0 1 ${cx + 9} 20`} stroke={color} strokeWidth={4} fill="none" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import type { Docket } from "../../services/docket.service";
import { normalizeDocketNumber } from "../../utils/dockets";

interface Props {
  value: string;
  options: Docket[];
  onChange: (value: string, matched?: Docket) => void;
}

export default function DocketNumberInput({
  value,
  options,
  onChange,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const matches = useMemo(() => {
    const q = value.trim().toUpperCase();
    const list = q
      ? options.filter((docket) =>
          docket.docket_number.toUpperCase().includes(q)
        )
      : options;
    return list.slice(0, 12);
  }, [options, value]);

  useEffect(() => {
    setActive(0);
  }, [matches]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectDocket = (docket: Docket) => {
    onChange(docket.docket_number, docket);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <input
        type="text"
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder="C1001785142"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const next = e.target.value.toUpperCase();
          const normalized = normalizeDocketNumber(next);
          const matched = options.find(
            (docket) => docket.docket_number === (normalized || next.trim())
          );
          onChange(next, matched);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || matches.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + matches.length) % matches.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            selectDocket(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-indigo-500"
      />

      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
          {matches.map((docket, index) => (
            <li key={docket.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectDocket(docket)}
                className={`block w-full px-3 py-2 text-left font-mono text-xs ${
                  index === active
                    ? "bg-amber-500/15 text-amber-200"
                    : "text-slate-200 hover:bg-white/5"
                }`}
              >
                {docket.docket_number}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

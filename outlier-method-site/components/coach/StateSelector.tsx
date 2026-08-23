"use client";

import type { StateOption } from "@/lib/states-client";

export function StateSelector({
  states,
  value,
  onChange,
}: {
  states: StateOption[];
  value: string | null;
  onChange: (code: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="border border-navy-900 bg-white px-3 py-2 text-[14px] font-medium text-navy-900"
    >
      <option value="" disabled>
        Select your state association
      </option>
      {states.map((s) => (
        <option key={s.state_code} value={s.state_code}>
          {s.association_name} ({s.state_name})
        </option>
      ))}
    </select>
  );
}

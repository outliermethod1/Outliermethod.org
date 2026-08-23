import { DISCLAIMER_BODY } from "@/lib/disclaimer";
import type { StateOption } from "@/lib/states-client";

interface ContactInfo {
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

export function DisclaimerBlock({ state }: { state: (StateOption & ContactInfo) | null }) {
  if (!state) return null;
  return (
    <div className="mt-4 border border-rule bg-white p-4">
      <p className="text-sm text-ink">
        Coach&rsquo;s read, based on {state.association_name} bylaws effective as cited above.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate">{DISCLAIMER_BODY}</p>
      <div className="mt-3 border-t border-rule pt-3 text-[13px] text-navy-900">
        <span className="eyebrow text-red">{state.association_name} eligibility contact</span>
        <p className="mt-1">
          {state.eligibility_contact_name ?? "Contact not yet configured"}
          {state.eligibility_contact_phone && <> &middot; {state.eligibility_contact_phone}</>}
          {state.eligibility_contact_email && <> &middot; {state.eligibility_contact_email}</>}
        </p>
      </div>
    </div>
  );
}

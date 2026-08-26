import { watchersForBylaw } from "./db/business";
import { sendEmail } from "./email";
import { getState } from "./db/states";

/** Best-effort — a failed notification should never block an ingestion. */
export async function notifyBylawWatchers(stateCode: string, bylawIds: string[], effectiveDate: string) {
  const state = await getState(stateCode);
  if (!state) return;

  for (const bylawId of bylawIds) {
    const watchers = await watchersForBylaw(stateCode, bylawId);
    for (const watcher of watchers) {
      await sendEmail({
        to: watcher.email,
        subject: `${state.association_name} amended ${bylawId}`,
        html: `<p>Hi${watcher.name ? ` ${watcher.name}` : ""},</p>
          <p>${state.association_name} amended bylaw <strong>${bylawId}</strong>, effective ${effectiveDate}.
          You were previously cited on this rule in a Coach Eli conversation.</p>
          <p><a href="https://outliermethod.org/bylaws/${stateCode}">See the current text</a>,
          or ask Coach Eli what changed.</p>`,
      });
    }
  }
}

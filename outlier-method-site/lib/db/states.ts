import { query, queryOne } from "./client";
import type { StateConfig } from "./types";

export async function listStates(): Promise<StateConfig[]> {
  return query<StateConfig>("select * from states order by state_name asc");
}

export async function getState(stateCode: string): Promise<StateConfig | null> {
  return queryOne<StateConfig>("select * from states where state_code = $1", [stateCode.toLowerCase()]);
}

export async function upsertState(cfg: StateConfig): Promise<StateConfig> {
  const row = await queryOne<StateConfig>(
    `insert into states (state_code, state_name, association_name, eligibility_contact_name, eligibility_contact_phone, eligibility_contact_email)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (state_code) do update set
       state_name = excluded.state_name,
       association_name = excluded.association_name,
       eligibility_contact_name = excluded.eligibility_contact_name,
       eligibility_contact_phone = excluded.eligibility_contact_phone,
       eligibility_contact_email = excluded.eligibility_contact_email,
       updated_at = now()
     returning *`,
    [
      cfg.state_code.toLowerCase(),
      cfg.state_name,
      cfg.association_name,
      cfg.eligibility_contact_name,
      cfg.eligibility_contact_phone,
      cfg.eligibility_contact_email,
    ]
  );
  if (!row) throw new Error("Failed to upsert state");
  return row;
}

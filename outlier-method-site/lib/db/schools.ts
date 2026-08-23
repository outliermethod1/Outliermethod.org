import { query } from "./client";

export interface School {
  id: string;
  state_code: string;
  name: string;
  city: string | null;
  classification: string | null;
  district_region: string | null;
  sports_sponsored: string[] | null;
  source: string;
}

/** Fuzzy name search scoped to a state, used by the school-lookup chat tool. */
export async function searchSchools(stateCode: string, nameQuery: string, limit = 5): Promise<School[]> {
  return query<School>(
    `select * from schools
     where state_code = $1 and name ilike '%' || $2 || '%'
     order by
       (lower(name) = lower($2)) desc,
       length(name) asc
     limit $3`,
    [stateCode.toLowerCase(), nameQuery.trim(), limit]
  );
}

export async function countSchoolsByState(): Promise<Record<string, number>> {
  const rows = await query<{ state_code: string; count: string }>(
    `select state_code, count(*)::text as count from schools group by state_code`
  );
  return Object.fromEntries(rows.map((r) => [r.state_code, Number(r.count)]));
}

export interface NewSchool {
  state_code: string;
  name: string;
  city?: string | null;
  classification?: string | null;
  district_region?: string | null;
  sports_sponsored?: string[] | null;
  source?: string;
}

/** Upsert by (state_code, name) — safe to re-run with an updated list. */
export async function upsertSchools(schools: NewSchool[]): Promise<number> {
  let count = 0;
  for (const s of schools) {
    await query(
      `insert into schools (state_code, name, city, classification, district_region, sports_sponsored, source)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (state_code, name) do update set
         city = excluded.city,
         classification = excluded.classification,
         district_region = excluded.district_region,
         sports_sponsored = excluded.sports_sponsored,
         source = excluded.source,
         updated_at = now()`,
      [
        s.state_code.toLowerCase(),
        s.name.trim(),
        s.city ?? null,
        s.classification ?? null,
        s.district_region ?? null,
        s.sports_sponsored ?? null,
        s.source ?? "manual",
      ]
    );
    count++;
  }
  return count;
}

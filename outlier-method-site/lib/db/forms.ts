import { query, queryOne } from "./client";

export type FormLevel = "high_school" | "college";

export interface FormTemplate {
  id: string;
  title: string;
  level: FormLevel;
  category: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export async function listFormTemplates(): Promise<FormTemplate[]> {
  return query<FormTemplate>(`select * from form_templates order by level, category, title`);
}

export async function getFormTemplate(id: string): Promise<FormTemplate | null> {
  return queryOne<FormTemplate>(`select * from form_templates where id = $1`, [id]);
}

export async function createFormTemplate(t: {
  title: string;
  level: FormLevel;
  category: string;
  body: string;
}): Promise<FormTemplate> {
  const row = await queryOne<FormTemplate>(
    `insert into form_templates (title, level, category, body) values ($1,$2,$3,$4) returning *`,
    [t.title, t.level, t.category, t.body]
  );
  if (!row) throw new Error("Failed to create form template");
  return row;
}

export async function updateFormTemplate(
  id: string,
  t: { title: string; level: FormLevel; category: string; body: string }
): Promise<FormTemplate | null> {
  return queryOne<FormTemplate>(
    `update form_templates set title=$2, level=$3, category=$4, body=$5, updated_at=now() where id=$1 returning *`,
    [id, t.title, t.level, t.category, t.body]
  );
}

export async function deleteFormTemplate(id: string): Promise<void> {
  await query(`delete from form_templates where id = $1`, [id]);
}

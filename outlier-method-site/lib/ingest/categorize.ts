import type { Category } from "../db/types";

const KEYWORDS: Record<Exclude<Category, "other">, string[]> = {
  transfer_residence: ["transfer", "residence", "residency", "domicile", "move", "relocat"],
  age: ["age", "birthdate", "birth date", "turns 19", "overage"],
  participation_limits: ["semester", "eight-semester", "8-semester", "years of eligibility", "participation limit", "seasons of competition"],
  academic_eligibility: ["academic", "gpa", "grade point", "credit", "passing", "scholastic"],
  amateurism_awards: ["amateur", "award", "prize", "endorsement", "nil", "name image and likeness"],
  undue_influence: ["undue influence", "recruit", "inducement", "solicitation"],
  foreign_exchange: ["foreign exchange", "international student", "visa", "csiet"],
  enrollment_homeschool: ["homeschool", "home school", "enrollment", "non-public", "private school"],
  sportsmanship_conduct: ["sportsmanship", "conduct", "ejection", "unsportsmanlike", "discipline"],
  classification_scheduling: ["classification", "schedul", "district assignment", "enrollment count", "reclassif"],
  officials: ["official", "referee", "umpire", "registration fee", "certification"],
};

export function categorize(title: string, body: string): Category {
  const text = `${title} ${body}`.toLowerCase();
  for (const [category, keywords] of Object.entries(KEYWORDS) as [Exclude<Category, "other">, string[]][]) {
    if (keywords.some((k) => text.includes(k))) return category;
  }
  return "other";
}

export const Role = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

/** Article body: store Markdown; render HTML. LATEX value is legacy DB rows only. */
export const ContentFormat = {
  MARKDOWN: "MARKDOWN",
  LATEX: "LATEX",
} as const;
export type ContentFormat = (typeof ContentFormat)[keyof typeof ContentFormat];

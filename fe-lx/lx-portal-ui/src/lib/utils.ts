import dayjs from "dayjs";

export const formatDate = (value?: string | null, fallback = "--") => {
  if (!value) return fallback;
  return dayjs(value).format("DD/MM/YYYY HH:mm");
};

export const htmlToText = (html?: string | null) => {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

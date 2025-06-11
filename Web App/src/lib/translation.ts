import { Translate } from "@google-cloud/translate/build/src/v2";


// Initialize the Google Cloud Translation client
const translate = new Translate({
  projectId: 	'able-device-462617-k2',
  keyFilename: "../../env/able-device-462617-k2-f621edb40e7c.json",
});

// Cache for translations to avoid unnecessary API calls
const translationCache = new Map<string, string>();

// Supported languages
export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "hi", name: "हिन्दी" },
  { code: "ja", name: "日本語" },
];

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (targetLanguage === "en") return text; // No need to translate if target is English

  const cacheKey = `${text}-${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const [translation] = await translate.translate(text, targetLanguage);
    translationCache.set(cacheKey, translation);
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  targetLanguage: string
): Promise<T> {
  if (targetLanguage === "en") return obj;

  const translatedEntries = await Promise.all(
    Object.entries(obj).map(async ([key, value]) => {
      if (typeof value === "string") {
        return [key, await translateText(value, targetLanguage)];
      }
      return [key, value];
    })
  );

  return Object.fromEntries(translatedEntries) as T;
}
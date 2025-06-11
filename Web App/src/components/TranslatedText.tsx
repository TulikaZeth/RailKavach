"use client";

import { useEffect, useState } from "react";
import { translateText } from "@/lib/translation";
import { useLanguage } from "@/context/LanguageContext";

export default function TranslatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (language !== "en") {
      translateText(text, language).then(setTranslatedText);
    } else {
      setTranslatedText(text);
    }
  }, [text, language]);

  return <span className={className}>{translatedText}</span>;
}
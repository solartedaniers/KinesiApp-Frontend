import { getT } from "@/lib/i18n/server";

/** Texto del consentimiento de video: el mismo en la página legal pública y en la aceptación. */
export async function VideoConsentText() {
  const t = await getT();
  return (
    <div>
      {t.consent.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

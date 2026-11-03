/**
 * Version der Datenschutzerklärung und Nutzungsbedingungen, der ein Konto zugestimmt hat (profiles.consent_version).
 * Bei einer wesentlichen Änderung der Texte hochzählen: Alle Nutzer werden beim nächsten Öffnen der App erneut gefragt.
 */
export const CONSENT_VERSION = '2026-11';

/** Ab diesem Alter dürfen Kinder in Deutschland selbst in die Datenverarbeitung einwilligen (Art. 8 DSGVO). */
export const CONSENT_AGE = 16;

/**
 * Angaben zum Betreiber für Impressum, Datenschutzerklärung, Nutzungsbedingungen und Kontakt.
 * PLATZHALTER: Alle Werte sind Dummys (siehe docs/TODO.md, Abschnitt „Rechtliches“). Nach dem Eintragen der echten
 * Angaben `LEGAL_DRAFT` auf `false` setzen, dann verschwindet der Entwurfshinweis auf den Rechtsseiten.
 */
export const OPERATOR = {
  name: '[Vor- und Nachname bzw. Firma]',
  legalForm: '[Rechtsform, z. B. Einzelunternehmen]',
  street: '[Straße und Hausnummer]',
  city: '[PLZ Ort]',
  country: 'Deutschland',
  email: 'kontakt@example.com',
  privacyEmail: 'datenschutz@example.com',
  phone: '[Telefonnummer]',
  /** Leer lassen, falls nicht vorhanden – die Zeile entfällt dann. */
  vatId: '[USt-IdNr., falls vorhanden]',
  register: '[Registergericht und -nummer, falls vorhanden]',
  /** Verantwortlich für journalistisch-redaktionelle Inhalte (§ 18 Abs. 2 MStV). */
  contentResponsible: '[Vor- und Nachname, Anschrift wie oben]',
} as const;

/** Die Rechtstexte sind Entwürfe mit Platzhaltern und noch nicht rechtlich geprüft. */
export const LEGAL_DRAFT = true;

/** Stand der Rechtstexte, wird auf den Seiten angezeigt. */
export const LEGAL_TEXTS_DATE = 'November 2026';

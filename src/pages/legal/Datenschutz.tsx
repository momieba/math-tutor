import { Link } from 'react-router';
import { PRODUCT_NAME } from '../../config/brand';
import { CONSENT_AGE, OPERATOR } from '../../config/legal';

/**
 * Datenschutzerklärung. Beschreibt den tatsächlichen Stand der App (Supabase Frankfurt, Vercel, localStorage für Sitzung und Entwürfe).
 * Bei neuen Diensten (SMTP-Anbieter, Stripe, Fehler-Monitoring, Videos, KI) ergänzen und CONSENT_VERSION hochzählen.
 */
export function Datenschutz() {
  return (
    <>
      <p>
        Wir nehmen den Schutz deiner Daten ernst. {PRODUCT_NAME} wird vor allem von Schülerinnen und Schülern genutzt – deshalb speichern wir nur, was
        für das Lernen nötig ist. Es gibt keine Werbung, kein Tracking und keinen Verkauf von Daten.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}
        <br />
        E-Mail: <a href={`mailto:${OPERATOR.privacyEmail}`}>{OPERATOR.privacyEmail}</a>
      </p>

      <h2>2. Aufruf der Website (Hosting)</h2>
      <p>
        Die Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet und über deren weltweites Servernetz ausgeliefert.
        Beim Aufruf verarbeitet Vercel technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Browser und Betriebssystem. Das
        ist nötig, um die Seite auszuliefern und vor Angriffen zu schützen (Art. 6 Abs. 1 lit. f DSGVO). Die Protokolle werden nach [Speicherdauer
        laut Vercel prüfen] gelöscht.
      </p>
      <p>
        Mit Vercel besteht ein Auftragsverarbeitungsvertrag. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert; zusätzlich gelten
        EU-Standardvertragsklauseln.
      </p>

      <h2>3. Konto und Lerndaten</h2>
      <p>Wenn du ein Konto anlegst und die App nutzt, speichern wir:</p>
      <ul>
        <li>Kontodaten: E-Mail-Adresse, Passwort (nur verschlüsselt als Hash), Name bzw. Spitzname, Zeitpunkt und Version deiner Einwilligung</li>
        <li>Lerndaten: gewählte Themen, deine Antworten, Punkte, genutzte Hinweise, ob du die Lösung angesehen hast, Zeitpunkte</li>
        <li>Handschrift: Bilder und Stiftstriche deiner handschriftlichen Lösungen</li>
        <li>Ergebnisse: Bewertungen, Rückmeldungen und dein Lernfortschritt</li>
      </ul>
      <p>
        Wir brauchen diese Daten, um dir die App bereitzustellen: Aufgaben bewerten, Fortschritt anzeigen, deinen Verlauf speichern (Art. 6 Abs. 1
        lit. b DSGVO). Deine Abgaben kannst nur du selbst sehen.
      </p>
      <p>
        Gespeichert werden die Daten bei Supabase Inc. auf Servern in Frankfurt am Main (EU). Supabase verarbeitet die Daten in unserem Auftrag
        (Auftragsverarbeitungsvertrag). Da Supabase ein US-Unternehmen ist, gelten zusätzlich EU-Standardvertragsklauseln. Zur Absicherung der
        Anmeldung protokolliert Supabase IP-Adressen bei Anmeldeversuchen (Art. 6 Abs. 1 lit. f DSGVO, Schutz vor Missbrauch).
      </p>

      <h2>4. Anmeldung mit Google</h2>
      <p>
        Wenn du dich mit Google anmeldest, übermittelt Google uns deine E-Mail-Adresse und deinen Namen. Dein Google-Passwort erfahren wir nicht.
        Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Die Anmeldung mit Google ist freiwillig; du kannst dich
        auch mit E-Mail und Passwort registrieren. Für die Verarbeitung durch Google gilt dessen Datenschutzerklärung.
      </p>

      <h2>5. Bewertung deiner Antworten</h2>
      <p>
        Deine Antworten werden automatisch nach festen Regeln auf unseren Servern bewertet. Dabei kommt keine künstliche Intelligenz zum Einsatz, und
        es werden keine Daten an Dritte weitergegeben. Die Bewertung dient nur als Lernhilfe und hat keine rechtliche Wirkung für dich (keine
        automatisierte Entscheidung im Sinne von Art. 22 DSGVO).
      </p>

      <h2>6. E-Mails</h2>
      <p>
        Wir schicken dir nur E-Mails, die für dein Konto nötig sind: zur Bestätigung der E-Mail-Adresse und zum Zurücksetzen des Passworts. Keine
        Newsletter, keine Werbung. Versanddienstleister: [Name und Sitz des E-Mail-Anbieters].
      </p>

      <h2>7. Speicherung im Browser</h2>
      <p>
        Wir setzen keine Cookies zu Werbe- oder Analysezwecken. Im Speicher deines Browsers (localStorage) legen wir nur ab, was für die Funktion
        nötig ist: deine Anmeldung, damit du angemeldet bleibst, und Entwürfe von Abgaben, die noch nicht gespeichert werden konnten (z. B. ohne
        Internetverbindung). Dafür ist keine Einwilligung nötig (§ 25 Abs. 2 Nr. 2 TDDDG). Beim Abmelden wird die Anmeldung entfernt.
      </p>

      <h2>8. Kinder und Jugendliche</h2>
      <p>
        Wer jünger als {CONSENT_AGE} Jahre ist, darf sich nur mit Einverständnis der Eltern registrieren. Das bestätigst du bei der Registrierung.
        Eltern können sich jederzeit an uns wenden, um Auskunft zu erhalten oder das Konto ihres Kindes löschen zu lassen.
      </p>

      <h2>9. Wie lange wir Daten speichern</h2>
      <p>
        Wir speichern deine Daten, solange dein Konto besteht. Wenn du dein Konto löschst, werden alle Daten einschließlich der Handschrift-Bilder
        sofort gelöscht. Konten, die [Anzahl] Monate nicht genutzt wurden, löschen wir nach vorheriger Ankündigung per E-Mail. Sicherungskopien werden
        nach spätestens [Anzahl] Tagen überschrieben.
      </p>

      <h2>10. Kostenpflichtige Angebote</h2>
      <p>
        Derzeit ist {PRODUCT_NAME} kostenlos. Bevor wir Abonnements einführen, ergänzen wir diese Datenschutzerklärung um die Zahlungsabwicklung und
        informieren dich vorher.
      </p>

      <h2>11. Deine Rechte</h2>
      <p>Du hast das Recht auf</p>
      <ul>
        <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung falscher Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)</li>
        <li>Widerruf einer Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
      </ul>
      <p>
        In der App kannst du unter <strong>Konto</strong> deine Daten selbst herunterladen und dein Konto endgültig löschen. Für alles andere schreib
        uns: <a href={`mailto:${OPERATOR.privacyEmail}`}>{OPERATOR.privacyEmail}</a>. Siehe auch <Link to="/legal/kontakt">Kontakt</Link>.
      </p>
      <p>
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei: [zuständige Aufsichtsbehörde am Sitz des
        Betreibers].
      </p>

      <h2>12. Änderungen</h2>
      <p>
        Wenn sich diese Datenschutzerklärung wesentlich ändert, informieren wir dich beim nächsten Öffnen der App und bitten dich erneut um deine
        Zustimmung.
      </p>
    </>
  );
}

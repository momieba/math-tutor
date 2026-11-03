import { Link } from 'react-router';
import { OPERATOR } from '../../config/legal';

export function Kontakt() {
  return (
    <>
      <p>Fragen, Probleme oder Ideen? Schreib uns – wir antworten in der Regel innerhalb weniger Werktage.</p>

      <h2>Allgemeine Fragen und Hilfe</h2>
      <p>
        E-Mail: <a href={`mailto:${OPERATOR.email}`} className="inline-flex min-h-11 items-center">{OPERATOR.email}</a>
      </p>

      <h2>Datenschutz</h2>
      <p>
        Für Auskunft, Berichtigung oder Löschung deiner Daten: <a href={`mailto:${OPERATOR.privacyEmail}`} className="inline-flex min-h-11 items-center">{OPERATOR.privacyEmail}</a>
      </p>
      <p>
        Vieles geht auch direkt in der App: Unter <strong>Konto</strong> kannst du deine Daten herunterladen und dein Konto endgültig löschen. Mehr
        dazu in der <Link to="/legal/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <h2>Anschrift</h2>
      <p>
        {OPERATOR.name}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
      </p>
    </>
  );
}

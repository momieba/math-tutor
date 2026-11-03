import { Link } from 'react-router';
import { PRODUCT_NAME } from '../../config/brand';
import { CONSENT_AGE, OPERATOR } from '../../config/legal';

/** Nutzungsbedingungen für die kostenlose Testphase. Abo-Bedingungen (Preise, Laufzeit, Widerruf) folgen mit Stripe. */
export function Nutzungsbedingungen() {
  return (
    <>
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese Bedingungen gelten für die Nutzung von {PRODUCT_NAME}. Anbieter ist {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city} (siehe{' '}
        <Link to="/legal/impressum">Impressum</Link>).
      </p>

      <h2>2. Was {PRODUCT_NAME} bietet</h2>
      <p>
        {PRODUCT_NAME} ist eine Lernplattform für Mathematik. Sie bietet Erklärungen, Übungsaufgaben, Hinweise und eine automatische Rückmeldung zu
        deinen Lösungen. {PRODUCT_NAME} ergänzt den Unterricht, ersetzt ihn aber nicht.
      </p>
      <p>
        Die automatische Bewertung wird sorgfältig entwickelt, kann aber Fehler machen. Wir erweitern und verbessern die Inhalte laufend und können
        sie dabei auch ändern. Wir bemühen uns um eine ständige Erreichbarkeit, können sie aber nicht garantieren, etwa bei Wartungsarbeiten.
      </p>

      <h2>3. Konto</h2>
      <ul>
        <li>Für die Nutzung brauchst du ein Konto. Bitte mach bei der Registrierung wahre Angaben.</li>
        <li>Ein Konto ist nur für eine Person. Halte dein Passwort geheim.</li>
        <li>
          Wer jünger als {CONSENT_AGE} Jahre ist, braucht das Einverständnis der Eltern. Minderjährige brauchen für kostenpflichtige Angebote immer
          die Zustimmung der Eltern.
        </li>
      </ul>

      <h2>4. Kostenlose Testphase und spätere Abonnements</h2>
      <p>
        Während der Testphase ist {PRODUCT_NAME} kostenlos. Später wird es kostenpflichtige Abonnements mit monatlicher oder jährlicher Laufzeit
        geben. Ein kostenloses Konto wird nie automatisch kostenpflichtig: Ein Abonnement entsteht nur, wenn du es ausdrücklich abschließt. Preise,
        Laufzeit, Kündigung und dein Widerrufsrecht erfährst du vor dem Abschluss; sie werden dann Teil dieser Bedingungen.
      </p>

      <h2>5. Faire Nutzung</h2>
      <p>Bitte nutze {PRODUCT_NAME} nur zum Lernen. Nicht erlaubt ist insbesondere:</p>
      <ul>
        <li>rechtswidrige, beleidigende oder anstößige Inhalte hochzuladen oder zu zeichnen</li>
        <li>die App automatisiert abzufragen, anzugreifen oder Sicherheitsmaßnahmen zu umgehen</li>
        <li>Inhalte der App zu kopieren, weiterzuverbreiten oder kommerziell zu nutzen</li>
      </ul>

      <h2>6. Rechte an Inhalten</h2>
      <p>
        Erklärungen, Aufgaben, Videos und Grafiken sind urheberrechtlich geschützt. Du darfst sie für dein eigenes Lernen nutzen. Deine Antworten und
        handschriftlichen Lösungen gehören dir; du erlaubst uns nur, sie zu speichern und zu verarbeiten, um dir die App bereitzustellen.
      </p>

      <h2>7. Haftung</h2>
      <p>
        Für die kostenlose Nutzung haften wir nur bei Vorsatz und grober Fahrlässigkeit. Unberührt bleibt die Haftung für Schäden an Leben, Körper
        oder Gesundheit sowie nach dem Produkthaftungsgesetz. [Haftungsregelung für Abonnements rechtlich prüfen lassen.]
      </p>

      <h2>8. Konto löschen und Beendigung</h2>
      <p>
        Du kannst dein Konto jederzeit unter <strong>Konto</strong> in der App löschen. Wir können die Nutzung mit einer Frist von zwei Wochen
        beenden, bei schweren Verstößen gegen diese Bedingungen auch sofort.
      </p>

      <h2>9. Änderungen dieser Bedingungen</h2>
      <p>
        Wenn wir diese Bedingungen wesentlich ändern, informieren wir dich beim nächsten Öffnen der App und bitten dich um deine Zustimmung. Ohne
        Zustimmung kannst du die App nicht weiter nutzen, aber jederzeit deine Daten herunterladen und dein Konto löschen.
      </p>

      <h2>10. Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Wenn du als Verbraucher deinen gewöhnlichen Aufenthalt in einem anderen EU-Staat hast, behältst du den Schutz der
        dort zwingend geltenden Verbraucherschutzvorschriften. Sollte eine Bestimmung unwirksam sein, bleiben die übrigen wirksam.
      </p>
    </>
  );
}

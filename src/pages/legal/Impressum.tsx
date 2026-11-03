import { OPERATOR } from '../../config/legal';

/** Pflichtangaben nach § 5 DDG und § 18 MStV. Werte aus OPERATOR (derzeit Platzhalter). */
export function Impressum() {
  return (
    <>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {OPERATOR.name}
        <br />
        {OPERATOR.legalForm}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
        <br />
        {OPERATOR.country}
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${OPERATOR.email}`} className="inline-flex min-h-11 items-center">{OPERATOR.email}</a>
        <br />
        Telefon: {OPERATOR.phone}
      </p>

      {(OPERATOR.vatId || OPERATOR.register) && (
        <>
          <h2>Register und Umsatzsteuer</h2>
          <p>
            {OPERATOR.register && (
              <>
                {OPERATOR.register}
                <br />
              </>
            )}
            {OPERATOR.vatId && <>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {OPERATOR.vatId}</>}
          </p>
        </>
      )}

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{OPERATOR.contentResponsible}</p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    </>
  );
}

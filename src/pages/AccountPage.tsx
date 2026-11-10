import { Download, KeyRound, Trash2, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { TextField } from '../components/AuthLayout';
import { Button, Dialog, useToast } from '../components/ui';
import { PRODUCT_NAME } from '../config/brand';
import { useAuth } from '../context/AuthContext';
import { services } from '../services';

const card = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4';
const errorText = (err: unknown) => (err instanceof Error && err.message ? err.message : 'Das hat nicht geklappt. Bitte versuche es erneut.');

/** Konto: Passwort ändern, eigene Daten herunterladen (DSGVO Art. 15/20), Konto endgültig löschen (Art. 17). */
export default function AccountPage() {
  const { session } = useAuth();
  const user = session!.user;
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    setPwError(null);
    try {
      await services.auth.updatePassword(password);
      setPassword('');
      toast('Passwort geändert');
    } catch (err) {
      setPwError(errorText(err));
    } finally {
      setPwBusy(false);
    }
  }

  async function downloadData() {
    setExportBusy(true);
    setExportError(null);
    try {
      const data = await services.learner.exportData(user.id);
      const payload = { exportedAt: new Date().toISOString(), product: PRODUCT_NAME, account: { email: user.email, displayName: user.displayName, createdAt: user.createdAt }, ...data };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${PRODUCT_NAME.toLowerCase()}-daten-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(errorText(err));
    } finally {
      setExportBusy(false);
    }
  }

  async function deleteAccount() {
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await services.auth.deleteAccount();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(errorText(err));
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Dein Konto</h1>

      <section className={card} aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="flex items-center gap-2 text-xl font-semibold">
          <UserRound aria-hidden="true" size={20} /> Profil
        </h2>
        <dl className="grid gap-2 sm:grid-cols-[10rem_1fr]">
          <dt className="text-slate-600">Name</dt>
          <dd>{user.displayName}</dd>
          <dt className="text-slate-600">E-Mail</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-slate-600">Dabei seit</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString('de-DE', { dateStyle: 'long' })}</dd>
        </dl>
      </section>

      <form className={card} onSubmit={changePassword} aria-labelledby="password-heading">
        <h2 id="password-heading" className="flex items-center gap-2 text-xl font-semibold">
          <KeyRound aria-hidden="true" size={20} /> Passwort ändern
        </h2>
        <TextField
          className="max-w-sm"
          label="Neues Passwort"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="Mindestens 8 Zeichen."
        />
        {pwError && (
          <p role="alert" className="text-sm text-red-700">
            {pwError}
          </p>
        )}
        <Button type="submit" variant="secondary" loading={pwBusy}>
          Passwort speichern
        </Button>
      </form>

      <section className={card} aria-labelledby="export-heading">
        <h2 id="export-heading" className="flex items-center gap-2 text-xl font-semibold">
          <Download aria-hidden="true" size={20} /> Deine Daten
        </h2>
        <p className="text-slate-600">Lade alles herunter, was wir über dich gespeichert haben: Profil, aktive Themen und alle Abgaben mit Bewertung (als JSON-Datei).</p>
        {exportError && (
          <p role="alert" className="text-sm text-red-700">
            {exportError}
          </p>
        )}
        <Button variant="secondary" icon={<Download aria-hidden="true" size={20} />} onClick={() => void downloadData()} loading={exportBusy}>
          Meine Daten herunterladen
        </Button>
      </section>

      <section className={`${card} border-red-200`} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className="flex items-center gap-2 text-xl font-semibold text-red-800">
          <Trash2 aria-hidden="true" size={20} /> Konto löschen
        </h2>
        <p className="text-slate-600">Dein Konto, dein Lernstand und alle Abgaben (auch Bilder deines Rechenwegs) werden sofort und endgültig gelöscht.</p>
        <Button variant="danger" icon={<Trash2 aria-hidden="true" size={20} />} onClick={() => setConfirmDelete(true)}>
          Konto löschen …
        </Button>
      </section>

      <Dialog
        open={confirmDelete}
        title="Konto wirklich löschen?"
        icon={<Trash2 size={22} />}
        onClose={() => !deleteBusy && setConfirmDelete(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleteBusy}>
              Abbrechen
            </Button>
            <Button variant="danger" onClick={() => void deleteAccount()} loading={deleteBusy}>
              Ja, endgültig löschen
            </Button>
          </>
        }
      >
        <p>Das lässt sich nicht rückgängig machen. Lade vorher deine Daten herunter, wenn du sie behalten möchtest.</p>
        {deleteError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {deleteError}
          </p>
        )}
      </Dialog>
    </div>
  );
}

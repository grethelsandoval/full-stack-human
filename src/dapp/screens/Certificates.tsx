import { Award, BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import {
  type Booking,
  certificateId,
  completedBookings,
  formatSession,
} from "../bookings";
import { findModule, trainer } from "../catalog";
import { NETWORK_LABEL, STELLAR_EXPERT } from "../config";
import { CopyAddress, TxLink } from "../ui";

export default function Certificates({
  bookings,
  onOpenBooking,
  onOpenCatalog,
}: {
  bookings: Booking[];
  onOpenBooking: (id: string) => void;
  onOpenCatalog: () => void;
}) {
  const completed = completedBookings(bookings);
  if (completed.length === 0) {
    return (
      <section className="da-card da-empty">
        <Award size={28} />
        <p>
          Todavía no tienes módulos completados. Agenda una sesión, confírmala
          al terminar y libera el escrow para recibir tu credencial.
        </p>
        <button
          type="button"
          className="da-button da-button-primary"
          onClick={onOpenCatalog}
        >
          Ver catálogo
        </button>
      </section>
    );
  }
  return (
    <ul className="da-cert-list" aria-label="Certificados obtenidos">
      {completed.map((booking) => {
        const module = findModule(booking.moduleId);
        const issuedHash = booking.txHashes.release;
        return (
          <li
            key={booking.id}
            className="da-card da-cert"
            data-testid="certificate"
          >
            <header>
              <span className="da-tag mint">
                <BadgeCheck size={12} /> Credencial verificable
              </span>
              <span className="da-mono">{certificateId(booking)}</span>
            </header>
            <div className="da-cert-body">
              <span className="da-cert-seal" aria-hidden="true">
                <Award size={30} />
              </span>
              <div>
                <p className="da-cert-kicker">Full Stack Human certifica que</p>
                <p className="da-cert-holder">
                  <CopyAddress address={booking.wallet} label="titular" />
                </p>
                <p>
                  completó el módulo{" "}
                  <strong>{module?.title ?? booking.moduleId}</strong>
                  {module && <> (Dominio BESSI: {module.domain})</>} con{" "}
                  {trainer.name}.
                </p>
              </div>
            </div>
            <dl className="da-kv">
              <div>
                <dt>Sesión</dt>
                <dd>
                  <code>
                    {formatSession(booking.sessionAt, booking.timezone)}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Red</dt>
                <dd>{NETWORK_LABEL}</dd>
              </div>
              <div>
                <dt>Escrow liquidado</dt>
                <dd>
                  <a
                    className="da-link"
                    href={`${STELLAR_EXPERT}/contract/${booking.contractId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ShieldCheck size={12} /> Contrato Soroban{" "}
                    <ExternalLink size={12} />
                  </a>
                </dd>
              </div>
              {issuedHash && (
                <div>
                  <dt>Emisión</dt>
                  <dd>
                    <TxLink hash={issuedHash} label="Tx de liberación" />
                  </dd>
                </div>
              )}
            </dl>
            <footer>
              <p className="da-footnote">
                Prueba de finalización anclada a la liberación del escrow. La
                emisión del credential ACTA como contrato propio está en
                desarrollo.
              </p>
              <button
                type="button"
                className="da-button da-button-ghost"
                onClick={() => onOpenBooking(booking.id)}
              >
                Ver reserva
              </button>
            </footer>
          </li>
        );
      })}
    </ul>
  );
}

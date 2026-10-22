import { pageStyles as styles } from "@/components/app/page-classes";
import { FormAlert } from "@/components/ui/FormAlert";
import { rpcErrorKind } from "@/lib/grpc/errors";
import { type PingResult as PingOutcome, systemGateway } from "@/lib/grpc/system-gateway";
import { getFormat, getT } from "@/lib/i18n/server";

/** Async Server Component: la página lo envuelve en <Suspense> y llega por streaming cuando responde el backend. */
export async function PingResult() {
  const [t, format] = await Promise.all([getT(), getFormat()]);
  let outcome: PingOutcome;
  try {
    outcome = await systemGateway().ping(t.systemPing.probe);
  } catch (error) {
    return <FormAlert tone="error">{t.systemPing.errors[rpcErrorKind(error)]}</FormAlert>;
  }
  return (
    <dl className={`${styles.card} ${styles.details}`}>
      <div className={styles.detail}>
        <dt>{t.systemPing.sent}</dt>
        <dd>{t.systemPing.probe}</dd>
      </div>
      <div className={styles.detail}>
        <dt>{t.systemPing.received}</dt>
        <dd>{outcome.message}</dd>
      </div>
      {outcome.serverTime && (
        <div className={styles.detail}>
          <dt>{t.systemPing.serverTime}</dt>
          <dd>{format.dateTime(outcome.serverTime.toISOString())}</dd>
        </div>
      )}
      <div className={styles.detail}>
        <dt>{t.systemPing.roundTrip}</dt>
        <dd>{format.secondsFromMs(outcome.roundTripMs)}</dd>
      </div>
    </dl>
  );
}

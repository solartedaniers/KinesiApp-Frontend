import { cssVars } from "@/lib/design/css";

/**
 * Cifra que cuenta desde cero hasta su valor con un contador CSS, sin JavaScript. `text` es el valor ya
 * formateado por el idioma ("110°", "42 %"): separo el número para animarlo y dejo el resto tal cual.
 * Los lectores de pantalla leen el texto completo, nunca la cuenta.
 */
export function CountUp({ value, text, delayMs = 0, className }: { value: number; text: string; delayMs?: number; className?: string }) {
  const digits = String(Math.round(value));
  const at = text.indexOf(digits);
  if (at < 0) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      <span aria-hidden>
        {text.slice(0, at)}
        <span className="kin-count" style={cssVars({ "--to": Math.round(value), "--delay": `${delayMs}ms` })} />
        {text.slice(at + digits.length)}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}

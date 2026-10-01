"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/config";
import { FORM_INTENT } from "@/lib/form-state";
import { format, t } from "@/lib/i18n";

/**
 * Botón "enviar un código nuevo" con espera entre envíos. El padre lo monta con
 * `key={codeSentId}`: cada envío nuevo remonta el botón y reinicia la cuenta regresiva.
 */
export function ResendCodeButton({ coolingDown, pending }: { coolingDown: boolean; pending: boolean }) {
  const [remaining, setRemaining] = useState(coolingDown ? OTP_RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <Button
      type="submit"
      name="intent"
      value={FORM_INTENT.resend}
      variant="ghost"
      block
      disabled={pending || remaining > 0}
      formNoValidate
    >
      {remaining > 0 ? format(t.otp.resendIn, { seconds: remaining }) : t.otp.resend}
    </Button>
  );
}

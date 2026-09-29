import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PHONE_COUNTRIES, composePhone, countryByIso, parseStoredPhone } from "@/lib/phone";

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (e164: string) => void;
  className?: string;
  inputClassName?: string;
  required?: boolean;
  disabled?: boolean;
}

const PhoneInput = ({ id, value, onChange, className, inputClassName, required, disabled }: PhoneInputProps) => {
  const [iso, setIso] = useState(() => parseStoredPhone(value).iso);
  const [national, setNational] = useState(() => parseStoredPhone(value).national);
  const country = countryByIso(iso);

  useEffect(() => {
    const next = parseStoredPhone(value, iso);
    setNational(next.national);
    if (value) setIso(next.iso);
    // iso is only a hint for shared dial codes; do not reset an empty field to Maroc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emit = (nextIso: string, nextNational: string) => {
    const nextCountry = countryByIso(nextIso);
    let local = nextNational.replace(/\D/g, "");
    if (local.startsWith("0")) local = local.slice(1);
    local = local.slice(0, nextCountry.max);
    setIso(nextIso);
    setNational(local);
    onChange(composePhone(nextIso, local));
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <select
        aria-label="Indicatif pays"
        disabled={disabled}
        value={iso}
        onChange={(e) => emit(e.target.value, national)}
        className="h-11 w-[8.5rem] shrink-0 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {PHONE_COUNTRIES.map((item) => (
          <option key={item.iso} value={item.iso}>
            {item.flag} +{item.displayDial}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        maxLength={country.max}
        placeholder={"0".repeat(country.min)}
        value={national}
        onChange={(e) => {
          const raw = e.target.value;
          const digits = raw.replace(/\D/g, "");
          if (raw.includes("+") || digits.length > country.max) {
            const parsed = parseStoredPhone(raw, iso);
            emit(parsed.iso, parsed.national);
            return;
          }
          emit(iso, digits);
        }}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData("text");
          if (!pasted) return;
          e.preventDefault();
          const parsed = parseStoredPhone(pasted, iso);
          emit(parsed.iso, parsed.national);
        }}
        onKeyDown={(e) => {
          if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
        }}
        className={cn("h-11", inputClassName)}
      />
    </div>
  );
};

export default PhoneInput;

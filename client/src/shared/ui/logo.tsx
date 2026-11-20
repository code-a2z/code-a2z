import { cn } from '../utils/cn';
import { ORGANISATION_NAME } from '../../config/env';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-7 place-items-center rounded-lg bg-ink font-mono text-[11px] font-semibold tracking-tight text-canvas',
        className
      )}
      aria-hidden="true"
    >
      A2Z*
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight">
        {ORGANISATION_NAME}
      </span>
    </span>
  );
}

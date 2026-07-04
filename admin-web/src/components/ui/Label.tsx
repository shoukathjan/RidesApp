import { LabelHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export default function Label({
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={cn('flex flex-col gap-1.5 text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
    </label>
  );
}

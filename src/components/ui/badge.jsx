import React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = {
  default: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-800",
  destructive: "bg-red-100 text-red-800",
  outline: "text-gray-700 border border-gray-200 bg-white",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
};

function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

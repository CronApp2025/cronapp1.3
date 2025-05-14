import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-primary hover:bg-secondary/90",
        destructive:
          "border-transparent bg-risk-high text-white hover:bg-risk-high/90",
        outline: "text-foreground border-primary text-primary",
        success: "border-transparent bg-risk-low text-white hover:bg-risk-low/90",
        warning: "border-transparent bg-risk-medium text-white hover:bg-risk-medium/90",
        info: "border-transparent bg-info text-white hover:bg-info/90",
        muted: "border-transparent bg-muted text-white hover:bg-muted/90",
        riskHigh: "border-transparent bg-risk-high/15 text-risk-high border-risk-high/30",
        riskMedium: "border-transparent bg-risk-medium/15 text-risk-medium border-risk-medium/30",
        riskLow: "border-transparent bg-risk-low/15 text-risk-low border-risk-low/30",
        infoLight: "border-transparent bg-info/15 text-info border-info/30",
        primaryLight: "border-transparent bg-primary/15 text-primary border-primary/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Removed default bg-card, text-card-foreground, shadow-sm, and border.
      // Background, text, and shadow will be applied via specific classes or theme.
      // Border is removed as per user request.
      "rounded-lg", // Keep rounded corners
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement, // Changed back to HTMLHeadingElement for semantics
  React.HTMLAttributes<HTMLHeadingElement> // Use HTMLAttributes for heading
>(({ className, ...props }, ref) => (
  // Use h2 by default, can be overridden with `as` prop if needed
  <h2
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // Adjusted text size/weight if necessary
      className
    )}
    {...props} // Spread props correctly
  />
))
CardTitle.displayName = "CardTitle"


const CardDescription = React.forwardRef<
  HTMLParagraphElement, // Changed back to HTMLParagraphElement for semantics
  React.HTMLAttributes<HTMLParagraphElement> // Use HTMLAttributes for paragraph
>(({ className, ...props }, ref) => (
  // Use <p> element
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} // Spread props correctly
  />
))
CardDescription.displayName = "CardDescription"


const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
    
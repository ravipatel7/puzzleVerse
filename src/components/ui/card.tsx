import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Removed default bg-card, text-card-foreground, shadow-sm. These will be added with glassmorphism styles.
      "rounded-lg border", // Keep border for the glass edge effect
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
  HTMLDivElement, // Changed from HTMLParagraphElement to HTMLDivElement for consistency
  React.HTMLAttributes<HTMLDivElement> // Changed from HTMLHeadingElement
>(({ className, ...props }, ref) => (
  // Ensure CardTitle uses <div> or appropriate heading tag if needed semantically
  <div // Using div, but consider h2 or h3 if appropriate for structure
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
  HTMLDivElement, // Changed from HTMLParagraphElement to HTMLDivElement for consistency
  React.HTMLAttributes<HTMLDivElement> // Changed from HTMLParagraphElement
>(({ className, ...props }, ref) => (
  <div // Using div, consider <p> if always paragraph content
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

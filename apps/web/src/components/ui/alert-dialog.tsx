"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger as BaseDialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AlertDialogRootProps = React.ComponentProps<typeof Dialog>

function AlertDialog(props: AlertDialogRootProps) {
  return <Dialog {...props} />
}

type AlertDialogTriggerProps = React.ComponentProps<typeof BaseDialogTrigger>

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseDialogTrigger {...props} />
}

type AlertDialogContentProps = React.ComponentProps<typeof DialogContent>

function AlertDialogContent({ className, ...props }: AlertDialogContentProps) {
  return (
    <DialogContent
      className={cn("sm:max-w-md", className)}
      {...props}
    />
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogHeader
      className={cn("space-y-1.5", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogFooter
      className={cn("mt-2", className)}
      {...props}
    />
  )
}

type AlertDialogTitleProps = React.ComponentProps<typeof DialogTitle>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <DialogTitle
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

type AlertDialogDescriptionProps = React.ComponentProps<
  typeof DialogDescription
>

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <DialogDescription
      className={cn("text-xs sm:text-sm", className)}
      {...props}
    />
  )
}

type AlertDialogActionProps = React.ComponentProps<typeof Button>

function AlertDialogAction({
  className,
  ...props
}: AlertDialogActionProps) {
  return (
    <Button
      size="sm"
      className={cn(className)}
      {...props}
    />
  )
}

type AlertDialogCancelProps = React.ComponentProps<typeof Button>

function AlertDialogCancel({
  className,
  ...props
}: AlertDialogCancelProps) {
  return (
    <DialogClose asChild>
      <Button
        variant="outline"
        size="sm"
        className={cn(className)}
        {...props}
      />
    </DialogClose>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

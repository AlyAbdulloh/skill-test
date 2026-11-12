"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

function ComboboxRoot<Value, Multiple extends boolean | undefined = false>({
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple>) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.Label.Props) {
  return (
    <ComboboxPrimitive.Label
      data-slot="combobox-label"
      className={cn("text-sm font-medium text-slate-700", className)}
      {...props}
    />
  )
}

function ComboboxInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition-all duration-150 hover:border-slate-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 text-slate-400 shrink-0" />
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxPopup({
  className,
  ...props
}: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner className="isolate z-50">
        <ComboboxPrimitive.Popup
          data-slot="combobox-popup"
          className={cn(
            "z-50 max-h-72 w-(--anchor-width) min-w-52 origin-(--transform-origin) overflow-hidden rounded-xl bg-white p-1.5 text-sm text-slate-700 shadow-xl ring-1 ring-slate-900/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("max-h-64 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none select-none transition-colors duration-100 data-highlighted:bg-cyan-50 data-highlighted:text-cyan-700 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="text-cyan-500" />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn("px-2 py-8 text-center text-sm text-slate-400", className)}
      {...props}
    />
  )
}

export {
  ComboboxRoot as Combobox,
  ComboboxLabel,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
}

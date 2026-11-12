"use client";

import React, { useState, useMemo, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check, LucideIcon } from "lucide-react";

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface FormInputOption {
  label: string;
  value: string | number;
}

export interface FormInputProps {
  value?: string | number;
  onChange?: (val: string | number) => void;
  type?: 
    | "text"
    | "number"
    | "date"
    | "time"
    | "password"
    | "textarea"
    | "select"
    | "select-search"
    | "combobox"
    | "phone"
    | "custom";
  label?: string;
  required?: boolean;
  placeholder?: string;
  options?: FormInputOption[];
  leftIcon?: LucideIcon | ReactNode;
  rightIcon?: LucideIcon | ReactNode;
  addClass?: string;
  disabled?: boolean;
  useToggle?: boolean;
  useCurrency?: boolean;
  errorMessage?: string;
  countryCode?: string;
  readonly?: boolean;
  maxLength?: number;
  onTogglePassword?: () => void;
  children?: ReactNode; // For custom
}

export function FormInput({
  value = "",
  onChange,
  type = "text",
  label = "",
  required = false,
  placeholder = "",
  options = [],
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  addClass = "",
  disabled = false,
  useToggle = false,
  useCurrency = false,
  errorMessage = "",
  countryCode = "+62",
  readonly = false,
  maxLength = 100,
  onTogglePassword,
  children,
}: FormInputProps) {
  const [openSelectSearch, setOpenSelectSearch] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  const formatDisplay = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === "") return "";
    const numberString = val.toString().replace(/\D/g, "");
    if (!numberString) return "";
    return "Rp " + numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const proxyValue = useMemo(() => {
    if (useCurrency) {
      return formatDisplay(value);
    }
    if (type === "phone" && value) {
      return String(value).replace(countryCode, "");
    }
    return value;
  }, [value, useCurrency, type, countryCode]);

  const handleChange = (newVal: string) => {
    if (!onChange) return;

    if (useCurrency) {
      let rawValue = String(newVal).replace(/\D/g, "");
      if (rawValue.length > 1) {
        rawValue = rawValue.replace(/^0+/, "");
      }
      if (rawValue.length > 12) {
        rawValue = rawValue.slice(0, 12);
      }
      onChange(rawValue);
    } else if (type === "phone") {
      const cleanedNumber = String(newVal).replace(/\D/g, "");
      onChange(countryCode + cleanedNumber);
    } else {
      onChange(newVal);
    }
  };

  const renderLeftIcon = () => {
    if (!LeftIcon) return null;
    return (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none flex items-center justify-center">
        {typeof LeftIcon === "function" || typeof LeftIcon === "object" ? (
          // @ts-expect-error Render icon
          <LeftIcon className="h-4 w-4" />
        ) : (
          LeftIcon
        )}
      </div>
    );
  };

  const renderRightIcon = () => {
    if (!RightIcon) return null;
    return (
      <div
        className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 flex items-center justify-center ${
          type === "password" || useToggle ? "cursor-pointer" : ""
        }`}
        onClick={() => {
          if (useToggle && onTogglePassword) {
            onTogglePassword();
          }
        }}
      >
        {typeof RightIcon === "function" || typeof RightIcon === "object" ? (
          // @ts-expect-error Render icon
          <RightIcon className="h-4 w-4" />
        ) : (
          RightIcon
        )}
      </div>
    );
  };

  const isTextInput = ["text", "number", "date", "time", "password", "phone"].includes(type);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[13px] font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {isTextInput && (
        <div className="relative w-full items-center">
          {renderLeftIcon()}

          <Input
            type={useCurrency ? "text" : type === "phone" ? "tel" : type}
            value={proxyValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            readOnly={readonly}
            maxLength={maxLength}
            className={cn(
              "h-[42px] rounded-xl border-slate-200 w-full transition-all text-sm shadow-none",
              LeftIcon ? "pl-9" : undefined,
              RightIcon ? "pr-9" : undefined,
              disabled
                ? "bg-slate-100 cursor-not-allowed opacity-70"
                : "bg-white hover:bg-slate-50 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500",
              addClass
            )}
          />

          {renderRightIcon()}
        </div>
      )}

      {type === "textarea" && (
        <Textarea
          disabled={disabled}
          placeholder={placeholder}
          value={proxyValue}
          onChange={(e) => {
            let val = e.target.value;
            if (val.length > maxLength) val = val.slice(0, maxLength);
            if (onChange) onChange(val);
          }}
          className={cn(
            "min-h-[100px] rounded-xl border-slate-200 resize-none text-sm shadow-none",
            disabled ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white hover:bg-slate-50 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500",
            addClass
          )}
        />
      )}

      {type === "select" && (
        <Select
          value={String(proxyValue)}
          onValueChange={(val) => onChange && onChange(val ?? "")}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "!h-[42px] w-full rounded-xl border-slate-200 text-sm shadow-none px-3",
              disabled ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white hover:bg-slate-50 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500",
              addClass
            )}
          >
            <SelectValue placeholder={placeholder}>
              {proxyValue 
                ? options.find((opt) => String(opt.value) === String(proxyValue))?.label || proxyValue 
                : placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(type === "select-search" || type === "combobox") && (
        <Popover open={openSelectSearch || openCombobox} onOpenChange={type === "select-search" ? setOpenSelectSearch : setOpenCombobox}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSelectSearch || openCombobox}
                disabled={disabled}
                className={cn(
                  "h-[42px] w-full justify-between rounded-xl border-slate-200 font-normal text-left px-3 text-sm shadow-none hover:bg-slate-50",
                  !proxyValue && "text-slate-400",
                  disabled ? "bg-slate-100 cursor-not-allowed opacity-70" : "bg-white",
                  addClass
                )}
              >
                <span className="truncate">
                  {proxyValue
                    ? options.find((opt) => String(opt.value) === String(proxyValue))?.label
                    : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            }
          />
          <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
            <Command>
              <CommandInput placeholder={`Cari ${label || "..."}`} />
              <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={String(option.value)}
                      value={option.label}
                      onSelect={() => {
                        if (onChange) onChange(option.value);
                        setOpenSelectSearch(false);
                        setOpenCombobox(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-sky-600",
                          String(proxyValue) === String(option.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {type === "custom" && children}

      {errorMessage && (
        <span className="text-[11px] text-red-500 mt-0.5 ml-1 font-medium italic animate-in fade-in slide-in-from-top-1">
          * {errorMessage}
        </span>
      )}
    </div>
  );
}

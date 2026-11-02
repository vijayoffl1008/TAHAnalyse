/**
 * DateRangePicker — single date or date range picker.
 * Uses shadcn Calendar + Popover + date-fns.
 * Used by DataCollection, Reports, Logs.
 */

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Date format string (date-fns) */
  dateFormat?: string;
  /** Restrict selectable dates */
  disabledDays?: (date: Date) => boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  dateFormat = "dd MMM yyyy",
  disabledDays,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-44 justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={disabledDays}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

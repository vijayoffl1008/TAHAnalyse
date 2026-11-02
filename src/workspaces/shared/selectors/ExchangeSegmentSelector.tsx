/**
 * ExchangeSegmentSelector — cascading exchange → segment selector.
 * Replaces Angular DataService.setExchanges() / setSegments() caching pattern.
 */

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/services/api/helper";
import { faqApi } from "@/services/api/clients";
import { CONSTANTS } from "@/lib/constants";

interface Props {
  exchange: string;
  segment: string;
  onExchangeChange: (v: string) => void;
  onSegmentChange:  (v: string) => void;
  disabled?: boolean;
}

function useExchanges() {
  return useQuery({
    queryKey: ["exchanges"],
    queryFn: () =>
      apiRequest<{ exchanges: string[] }>({
        url: CONSTANTS.API.SYMBOLS.GET_EXCHANGES,
        client: faqApi,
      }),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.exchanges,
  });
}

function useSegments(exchange: string) {
  return useQuery({
    queryKey: ["segments", exchange],
    queryFn: () =>
      apiRequest<{ segments: string[] }>({
        url: CONSTANTS.API.SYMBOLS.GET_SEGMENTS,
        params: { exchange },
        client: faqApi,
      }),
    enabled: !!exchange,
    staleTime: 10 * 60 * 1000,
    select: (data) => data.segments,
  });
}

export function ExchangeSegmentSelector({
  exchange,
  segment,
  onExchangeChange,
  onSegmentChange,
  disabled,
}: Props) {
  const { data: exchanges = [], isLoading: exLoading } = useExchanges();
  const { data: segments = [], isLoading: segLoading } = useSegments(exchange);

  return (
    <div className="flex gap-2 flex-wrap">
      {exLoading ? (
        <Skeleton className="h-9 w-36" />
      ) : (
        <Select value={exchange} onValueChange={onExchangeChange} disabled={disabled}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Exchange" />
          </SelectTrigger>
          <SelectContent>
            {exchanges.map((ex) => (
              <SelectItem key={ex} value={ex.toLowerCase()}>
                {ex}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {segLoading ? (
        <Skeleton className="h-9 w-36" />
      ) : (
        <Select
          value={segment}
          onValueChange={onSegmentChange}
          disabled={disabled || !exchange}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Segment" />
          </SelectTrigger>
          <SelectContent>
            {segments.map((seg) => (
              <SelectItem key={seg} value={seg.toLowerCase()}>
                {seg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

/**
 * StrategySelector — strategy type dropdown.
 * Fetches strategy/list/ from Django.
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
import { StrategyTypeDefinition } from "@/types/strategy-type";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function useStrategies() {
  return useQuery({
    queryKey: ["strategy-types"],
    queryFn: () =>
      apiRequest<{ strategies: StrategyTypeDefinition[] }>({
        url: CONSTANTS.API.STRATEGY.GET_STRATEGIES,
        client: faqApi,
      }),
    staleTime: 10 * 60 * 1000,
    select: (data) => data.strategies,
  });
}

export function StrategySelector({
  value,
  onValueChange,
  placeholder = "Select strategy",
  disabled,
}: Props) {
  const { data: strategies = [], isLoading } = useStrategies();

  if (isLoading) return <Skeleton className="h-9 w-52" />;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {strategies.map((s) => (
          <SelectItem key={s._id} value={s._id}>
            {s.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

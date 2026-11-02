/**
 * BrokerSelector — broker account dropdown.
 * Filters by acc_id when provided.
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
import { BrokerAccount } from "@/types/broker";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  /** Filter brokers to this account ID */
  accId?: string;
  placeholder?: string;
  disabled?: boolean;
}

function useBrokers(accId?: string) {
  return useQuery({
    queryKey: ["brokers", accId],
    queryFn: () =>
      apiRequest<{ broker_accounts: BrokerAccount[] }>({
        url: CONSTANTS.API.BROKER.USER_BROKERS,
        params: accId ? { acc_id: accId, dt: "list" } : { dt: "list" },
        client: faqApi,
      }),
    staleTime: 5 * 60 * 1000,
    select: (data) => data.broker_accounts,
  });
}

export function BrokerSelector({
  value,
  onValueChange,
  accId,
  placeholder = "Select broker",
  disabled,
}: Props) {
  const { data: brokers = [], isLoading } = useBrokers(accId);

  if (isLoading) return <Skeleton className="h-9 w-52" />;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {brokers.map((ba) => (
          <SelectItem key={ba._id} value={ba._id}>
            {ba.name}/{ba.client_id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { useBrokers };

/**
 * UserSelector — admin user dropdown.
 * Fetches account/list/ from Django, caches via TanStack Query.
 * Replaces Angular DataService.setUsers() + shared user lists.
 *
 * FIX: queryFn returns the accounts array directly (matching UsersPage's query),
 * so the TanStack Query cache shape is consistent across all consumers.
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
import { accountApi } from "@/services/api/account.api";

interface Account {
  _id: string;
  user: { _id: string; full_name: string };
}

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Include an "All Users" option at the top */
  includeAll?: boolean;
  allLabel?: string;
}

function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountApi.listAccounts().then((r) => r.accounts),
    staleTime: 5 * 60 * 1000,
  });
}

export function UserSelector({
  value,
  onValueChange,
  placeholder = "Select user",
  disabled,
  includeAll,
  allLabel = "All Users",
}: Props) {
  const { data: accounts = [], isLoading } = useAccounts();

  if (isLoading) return <Skeleton className="h-9 w-48" />;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll && (
          <SelectItem value="all">{allLabel}</SelectItem>
        )}
        {(accounts as Account[]).map((acc) => (
          <SelectItem key={acc._id} value={acc._id}>
            {acc.user.full_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Export the hook separately for pages that need the raw data */
export { useAccounts };

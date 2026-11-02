/**
 * ChannelsPage — feed channel management (admin only).
 * Ported from AlgoHopperBot channel.component.
 *
 * Features: server list dropdown, test mode toggle, channel table with
 * broker name / login status / connection status, start/stop, switch.
 * Dynamic server URL routing.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Play, Square, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatusBadge, notify } from "@/workspaces/shared";
import { channelApi, type ChannelServer, type Channel } from "@/services/api/channel.api";

export function ChannelsPage() {
  const [selectedServer, setSelectedServer] = useState("");
  const [testMode, setTestMode] = useState(false);

  // ── Server list ──────────────────────────────────────────────────────────
  const { data: servers = [], isLoading: serversLoading } = useQuery({
    queryKey: ["channel-servers"],
    queryFn: () => channelApi.getServerList().then((r) => r.server_list),
  });

  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].server_name);
      setTestMode(servers[0].test_mode === 1);
    }
  }, [servers, selectedServer]);

  const currentServer: ChannelServer | undefined = servers.find(
    (s) => s.server_name === selectedServer
  );

  // ── Channel list (dynamic server URL) ────────────────────────────────────
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["channels", currentServer?.api_url],
    queryFn: () => channelApi.getChannelList(currentServer!.api_url),
    enabled: !!currentServer?.api_url,
    select: (data: any) => data.channel_list ?? [],
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const startStopMutation = useMutation({
    mutationFn: ({ bname, action }: { bname: string; action: "start" | "stop" }) =>
      channelApi.startStopChannel(bname, action, currentServer!.api_url),
    onSuccess: (_d, vars) => {
      notify.success(`Channel ${vars.action === "start" ? "Started" : "Stopped"} successfully`);
    },
  });

  const switchMutation = useMutation({
    mutationFn: (bname: string) => channelApi.switchChannel(bname, currentServer!.api_url),
    onSuccess: () => notify.success("Channel Switched successfully"),
  });

  const modeMutation = useMutation({
    mutationFn: (mode: boolean) => channelApi.setServerFeedMode(mode, currentServer!.api_url),
    onSuccess: () => notify.success("Mode Updated successfully"),
  });

  const handleModeToggle = (checked: boolean) => {
    setTestMode(checked);
    if (currentServer) modeMutation.mutate(checked);
  };

  return (
    <div>
      <PageHeader
        title="Channels"
        description="Manage broker WebSocket feed channels"
      />

      {/* Server selector + test mode toggle */}
      <div className="flex items-center gap-4 mb-6">
        {serversLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <Select value={selectedServer} onValueChange={(v) => {
            setSelectedServer(v);
            const srv = servers.find((s) => s.server_name === v);
            if (srv) setTestMode(srv.test_mode === 1);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((s) => (
                <SelectItem key={s.server_name} value={s.server_name}>
                  {s.server_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Test Mode</span>
          <Switch checked={testMode} onCheckedChange={handleModeToggle} disabled={!currentServer || modeMutation.isPending} />
        </div>
      </div>

      {/* Channel table */}
      {channelsLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broker</TableHead>
                <TableHead>Login Status</TableHead>
                <TableHead>Connection Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No channels found.
                  </TableCell>
                </TableRow>
              ) : (
                channels.map((ch: Channel, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{ch.broker_name}</TableCell>
                    <TableCell><StatusBadge status={ch.login_status?.toLowerCase() === "connected" ? "success" : "warning"} label={ch.login_status} /></TableCell>
                    <TableCell>
                      <StatusBadge
                        status={ch.channel_status?.toLowerCase() === "connected" ? "running" : "stopped"}
                        label={ch.channel_status}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const action = ch.channel_status?.toLowerCase() === "connected" ? "stop" : "start";
                            startStopMutation.mutate({ bname: ch.broker_name, action });
                          }}
                          disabled={startStopMutation.isPending}
                          title={ch.channel_status?.toLowerCase() === "connected" ? "Stop" : "Start"}
                        >
                          {ch.channel_status?.toLowerCase() === "connected" ? (
                            <Square className="h-4 w-4 text-destructive" />
                          ) : (
                            <Play className="h-4 w-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => switchMutation.mutate(ch.broker_name)}
                          disabled={switchMutation.isPending}
                          title="Switch"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

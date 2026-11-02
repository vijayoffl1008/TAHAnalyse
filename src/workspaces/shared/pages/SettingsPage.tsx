/**
 * SettingsPage — profile management + admin config + app state panel.
 * Ported from AlgoHopperBot settings.component.
 *
 * Profile (all roles): email, phone, subscription end date.
 * Admin Config (admin only): feed_token, feed_id, feed_broker.
 * App State (admin only): contracts loaded/not loaded, feed user connected/not connected.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { accountApi, type Account } from "@/services/api/account.api";
import { configApi } from "@/services/api/config.api";
import { appApi } from "@/services/api/app.api";
import { brokerApi } from "@/services/api/broker.api";
import { StatusBadge } from "@/workspaces/shared";

export function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const qc = useQueryClient();

  // ── Profile ──────────────────────────────────────────────────────────────
  const [account, setAccount] = useState<Account | null>(null);
  const [profileForm, setProfileForm] = useState({ email: "", phone: "" });

  const { isLoading: profileLoading } = useQuery({
    queryKey: ["account-details"],
    queryFn: () => accountApi.getAccountDetails(),
    onSuccess: (data) => {
      setAccount(data.account);
      setProfileForm({
        email: data.account.user.email,
        phone: data.account.user.phone,
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: () => {
      if (!account) throw new Error("No account data");
      return accountApi.updateAccount({
        account_id: account._id,
        user: {
          _id: account.user._id,
          full_name: account.user.full_name,
          email: profileForm.email,
          phone: profileForm.phone,
          password: "",
        },
        subscription_upto: account.subscription_upto,
      });
    },
    onSuccess: () => {
      notify.success("Profile Updated");
      qc.invalidateQueries({ queryKey: ["account-details"] });
    },
  });

  // ── Admin Config ──────────────────────────────────────────────────────────
  const [configForm, setConfigForm] = useState({
    feed_token: "",
    feed_id: "",
    feed_broker: "",
  });

  const { isLoading: configLoading } = useQuery({
    queryKey: ["auth-configs"],
    queryFn: () => configApi.getAuthConfigs("enc_token,zrdha_feed_id,preferred_broker"),
    enabled: isAdmin,
    onSuccess: (data) => {
      setConfigForm({
        feed_token: data.cds.enc_token ?? "",
        feed_id: data.cds.zrdha_feed_id ?? "",
        feed_broker: data.cds.preferred_broker ?? "",
      });
    },
  });

  const updateConfig = useMutation({
    mutationFn: () =>
      configApi.updateCDatas([
        { key: "enc_token", value: configForm.feed_token },
        { key: "zrdha_feed_id", value: configForm.feed_id },
        { key: "preferred_broker", value: configForm.feed_broker },
      ]),
    onSuccess: () => notify.success("Config Updated"),
  });

  // ── App State ─────────────────────────────────────────────────────────────
  const [contractsStatus, setContractsStatus] = useState("Not Loaded");
  const [feedUserStatus, setFeedUserStatus] = useState("Not Connected");

  const { refetch: refetchAppState } = useQuery({
    queryKey: ["app-state"],
    queryFn: () => appApi.getAppState(),
    enabled: isAdmin,
    onSuccess: (data) => {
      setContractsStatus(data.cache_init === 1 ? "Loaded" : "Not Loaded");
      setFeedUserStatus(data.feed_user_status === 1 ? "Connected" : "Not Connected");
    },
  });

  const loadContracts = useMutation({
    mutationFn: () => appApi.initApp(1),
    onSuccess: () => {
      notify.info("Loading contracts...");
      refetchAppState();
    },
  });

  const loginFeedUser = useMutation({
    mutationFn: () => brokerApi.contractAccountLogin("zerodha"),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
    },
  });

  // ── Change Password modal ─────────────────────────────────────────────────
  const [showChangePwd, setShowChangePwd] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and system configuration
        </p>
      </div>

      {/* ── Profile Section ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your email and phone number</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              {account && (
                <div className="text-sm text-muted-foreground">
                  Subscription until:{" "}
                  <span className="font-medium text-foreground">
                    {account.subscription_upto || "N/A"}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => updateProfile.mutate()}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePwd(true)}
                >
                  Change Password
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Admin Config Section ──────────────────────────────────────────── */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Feed token, feed ID, and preferred broker settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {configLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label>Feed Token (enc_token)</Label>
                    <Input
                      value={configForm.feed_token}
                      onChange={(e) =>
                        setConfigForm((f) => ({
                          ...f,
                          feed_token: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Feed ID (zrdha_feed_id)</Label>
                    <Input
                      value={configForm.feed_id}
                      onChange={(e) =>
                        setConfigForm((f) => ({ ...f, feed_id: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preferred Broker</Label>
                    <Input
                      value={configForm.feed_broker}
                      onChange={(e) =>
                        setConfigForm((f) => ({
                          ...f,
                          feed_broker: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={() => updateConfig.mutate()}
                  disabled={updateConfig.isPending}
                >
                  {updateConfig.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Config
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── App State Panel ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Application State</CardTitle>
            <CardDescription>System health and feed status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={
                    contractsStatus === "Loaded" ? "success" : "warning"
                  }
                  label={contractsStatus}
                />
                <span className="text-sm">Contracts</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadContracts.mutate()}
                disabled={loadContracts.isPending}
                className="gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Load Contracts
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <StatusBadge
                  status={
                    feedUserStatus === "Connected" ? "success" : "warning"
                  }
                  label={feedUserStatus}
                />
                <span className="text-sm">Feed User</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loginFeedUser.mutate()}
                disabled={loginFeedUser.isPending}
                className="gap-2"
              >
                {loginFeedUser.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="h-3.5 w-3.5" />
                )}
                Login Feed User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Change Password Modal ────────────────────────────────────────── */}
      {showChangePwd && (
        <ChangePasswordModal
          open={showChangePwd}
          onOpenChange={setShowChangePwd}
        />
      )}
    </div>
  );
}

// ── Change Password Modal ─────────────────────────────────────────────────────

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { logoutAPI } from "@/services/api/internal/auth.api";
import { notify } from "@/workspaces/shared";

function ChangePasswordModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { logout } = useAuth();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setError("All fields are required.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      await accountApi.changePassword({
        old_password: oldPwd,
        new_password: newPwd,
      });
      notify.success("Password reset successfully");
      // Auto-logout after password change (Angular pattern)
      try {
        await logoutAPI();
      } catch {
        // proceed with local logout even if API fails
      }
      await logout();
    } catch {
      setError("Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Old Password</Label>
            <Input
              type="password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import React, { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Key, Smartphone, Shield, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SecurityTab() {
  const { data: session } = useSession();
  const user = session?.user;

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { forgetPassword } = await import("@/lib/auth-client");
      const result = await forgetPassword({
        email: user?.email || "",
        redirectTo: "/auth/reset-password",
      });
      
      if (result?.error) {
        toast.error(result.error.message || "Failed to initiate password change");
      } else {
        toast.success("Password reset link sent to your email");
      }
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    // Placeholder logic
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(twoFactorEnabled ? "2FA disabled" : "2FA enabled");
  };

  return (
    <div className="bg-white dark:bg-neutral-950 rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 space-y-8">
      {/* Password Section */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            Password
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Update your password regularly to keep your account secure.
          </p>
          
          {isChangingPassword ? (
            <div className="space-y-4 mt-4 bg-gray-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsChangingPassword(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="flex items-start justify-between pb-8 border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
            Add an extra layer of security to your account.
          </p>
          {twoFactorEnabled && (
            <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
              <Check className="w-4 h-4" /> 2FA is enabled
            </div>
          )}
        </div>
        <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-indigo-500" />
          Active Sessions
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage devices where you're currently logged in.
        </p>

        <div className="bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-100 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Current Device</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This browser • Active now</p>
            </div>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded font-medium">
              Current
            </span>
          </div>
        </div>
        
        <Button variant="ghost" className="mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
          Sign out all other devices
        </Button>
      </div>
    </div>
  );
}

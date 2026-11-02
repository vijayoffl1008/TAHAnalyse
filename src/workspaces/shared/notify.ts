/**
 * notify — centralised toast wrapper around Sonner.
 *
 * Replaces Angular NotificationService.showAlert(type, message).
 *
 * Usage:
 *   notify.success("Saved successfully");
 *   notify.error("Something went wrong");
 *   notify.warn("Check your input");
 *   notify.info("Loading data...");
 */

import { toast } from "sonner";

export const notify = {
  success: (message: string, description?: string) =>
    toast.success(message, { description }),

  error: (message: string, description?: string) =>
    toast.error(message, { description }),

  warn: (message: string, description?: string) =>
    toast.warning(message, { description }),

  info: (message: string, description?: string) =>
    toast.info(message, { description }),
};

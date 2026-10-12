const API_URL = import.meta.env.VITE_API_URL ?? "";

export type ResourceStatus = "available" | "closed" | "maintenance";
export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

export type BookingResource = {
  name: string;
  location: string;
  size: number;
  type: string;
  description: string | null;
  status: ResourceStatus;
};

export type BookingRecord = {
  id: number;
  booked_date: string;
  from_date: string;
  to_date: string;
  user_id: number;
  booking_name: string;
  purpose: string | null;
  attendees: number;
  quantity: number;
  status: BookingStatus;
  username?: string;
  location?: string;
  type?: string;
};

export type MaintenanceRecord = {
  id: number;
  booking_name: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "reported" | "assigned" | "in_progress" | "completed" | "cancelled";
  reporter_name: string;
  assigned_name: string | null;
  reported_date: string;
};

export type UtilisationRecord = {
  name: string;
  type: string;
  location: string;
  approved_bookings: number;
  booked_hours: number;
  items_reserved: number;
};

export type AuditRecord = {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  record_type: string;
  record_id: string;
  details: string | null;
  action_date: string;
};

type ApiError = { message?: string };

export async function apiRequest<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = (await response.json()) as T & ApiError;
  if (!response.ok) throw new Error(data.message ?? "Request failed");
  return data;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

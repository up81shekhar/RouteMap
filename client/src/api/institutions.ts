import { apiFetch } from "./client";

export type InstitutionSummary = { name: string; slug: string; joinCode?: string };

export type StudentSummary = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  lessonsCompleted: number;
  isActive: boolean;
};

export type InstitutionDashboard = {
  institution: InstitutionSummary;
  stats: { totalStudents: number; activeStudents: number; totalLessonsCompleted: number };
  roadmapEngagement: { roadmapSlug: string; studentsEngaged: number }[];
  students: StudentSummary[];
};

export function createInstitution(name: string, accessToken: string) {
  return apiFetch<{ institution: InstitutionSummary; accessToken: string }>("/institutions", {
    method: "POST",
    body: { name },
    accessToken,
  });
}

export function joinInstitution(joinCode: string, accessToken: string) {
  return apiFetch<{ institution: InstitutionSummary }>("/institutions/join", {
    method: "POST",
    body: { joinCode },
    accessToken,
  });
}

export function getMyInstitutionDashboard(accessToken: string) {
  return apiFetch<InstitutionDashboard>("/institutions/me", { accessToken });
}

export function requestDeleteInstitutionOtp(accessToken: string) {
  return apiFetch<{ ok: true }>("/institutions/me/delete/request-otp", { method: "POST", accessToken });
}

export function confirmDeleteInstitution(otp: string, accessToken: string) {
  return apiFetch<{ ok: true; accessToken: string }>("/institutions/me/delete/confirm", {
    method: "POST",
    body: { otp },
    accessToken,
  });
}

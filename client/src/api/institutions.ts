import { apiFetch } from "./client";
import type { ApiNote } from "./notes";

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

export function removeStudent(studentId: string, accessToken: string) {
  return apiFetch<{ ok: true }>(`/institutions/me/students/${studentId}`, { method: "DELETE", accessToken });
}

export type StudentRoadmapProgress = { roadmapSlug: string; lessonsCompleted: number; lastActivityAt: string | null };
export type StudentDetail = {
  student: { id: string; name: string; email: string; joinedAt: string };
  roadmaps: StudentRoadmapProgress[];
};

export function getStudentDetail(studentId: string, accessToken: string) {
  return apiFetch<StudentDetail>(`/institutions/me/students/${studentId}`, { accessToken });
}

export function inviteStudent(email: string, accessToken: string) {
  return apiFetch<{ ok: true }>("/institutions/me/invite", { method: "POST", body: { email }, accessToken });
}

export function sendNotice(subject: string, message: string, accessToken: string) {
  return apiFetch<{ ok: true; sentTo: number }>("/institutions/me/notices", {
    method: "POST",
    body: { subject, message },
    accessToken,
  });
}

export type MyNoteInput = {
  title: string;
  description: string;
  category: string;
  content: string;
  attachmentUrl: string;
  attachmentType: "pdf" | "image" | "";
  order: number;
};

export function listMyNotes(accessToken: string) {
  return apiFetch<{ notes: ApiNote[] }>("/institutions/me/notes", { accessToken });
}

export function createMyNote(input: MyNoteInput, accessToken: string) {
  return apiFetch<{ note: ApiNote }>("/institutions/me/notes", { method: "POST", body: input, accessToken });
}

export function updateMyNote(slug: string, patch: Partial<MyNoteInput>, accessToken: string) {
  return apiFetch<{ note: ApiNote }>(`/institutions/me/notes/${slug}`, {
    method: "PUT",
    body: patch,
    accessToken,
  });
}

export function toggleMyNotePublish(slug: string, accessToken: string) {
  return apiFetch<{ note: ApiNote }>(`/institutions/me/notes/${slug}/publish`, { method: "PATCH", accessToken });
}

export function deleteMyNote(slug: string, accessToken: string) {
  return apiFetch<{ ok: true }>(`/institutions/me/notes/${slug}`, { method: "DELETE", accessToken });
}

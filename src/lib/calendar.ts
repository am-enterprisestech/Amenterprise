/**
 * Utility for generating RFC 5545 compliant iCalendar (.ics) files
 * for project deadlines, sprints, and client review sessions.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate?: string | null;
  dueDate?: string | null;
  location?: string;
}

function formatDateToICS(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateIcsContent(event: CalendarEvent): string {
  const start = event.startDate ? formatDateToICS(event.startDate) : formatDateToICS(event.dueDate || new Date().toISOString());
  const end = event.dueDate ? formatDateToICS(event.dueDate) : start;
  const now = formatDateToICS(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Veloura Apparel//Client Executive Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@velouraapparel.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/\n/g, " ")}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "DESCRIPTION:Veloura Apparel Milestone Review",
    event.location ? `LOCATION:${event.location}` : "LOCATION:Veloura Apparel Client Executive Portal",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadIcsFile(filename: string, event: CalendarEvent) {
  const content = generateIcsContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename.replace(/[^a-zA-Z0-9_-]/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

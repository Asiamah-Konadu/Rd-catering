export type KitchenStatus = {
  isOpen: boolean;
  currentAccraTime: string;
  currentAccraDisplay: string;
  openingTime: string;
  closingTime: string;
  openingTimeDisplay: string;
  closingTimeDisplay: string;
  message: string;
};

/**
 * Format "HH:mm" (24h) to "h:mm A" (12h).
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24 || "";
  const [hStr, mStr] = time24.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${minutesFormatted} ${ampm}`;
}

/**
 * Get current time in Accra, Ghana (GMT / UTC+0).
 */
export function getAccraTime(now: Date = new Date()): {
  hours: number;
  minutes: number;
  timeString: string;
  displayTime: string;
} {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Accra",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hours = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minutes = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return {
      hours,
      minutes,
      timeString,
      displayTime: formatTime12Hour(timeString),
    };
  } catch {
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return {
      hours,
      minutes,
      timeString,
      displayTime: formatTime12Hour(timeString),
    };
  }
}

/**
 * Checks whether the kitchen is currently open based on Accra time.
 */
export function checkIsKitchenOpen(
  openingTime: string = "08:00",
  closingTime: string = "22:00",
  now: Date = new Date()
): KitchenStatus {
  const cleanOpen = (openingTime || "08:00").trim();
  const cleanClose = (closingTime || "22:00").trim();

  const [openH, openM] = cleanOpen.split(":").map((v) => parseInt(v, 10) || 0);
  const [closeH, closeM] = cleanClose.split(":").map((v) => parseInt(v, 10) || 0);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const { hours, minutes, timeString, displayTime } = getAccraTime(now);
  const currentMinutes = hours * 60 + minutes;

  let isOpen = false;

  if (openMinutes === closeMinutes) {
    isOpen = true;
  } else if (openMinutes < closeMinutes) {
    isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else {
    isOpen = currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  const openDisplay = formatTime12Hour(cleanOpen);
  const closeDisplay = formatTime12Hour(cleanClose);

  const message = isOpen
    ? `Kitchen is open until ${closeDisplay}. ASAP & scheduled orders available.`
    : `Kitchen is closed (${openDisplay} – ${closeDisplay}). Only scheduled pre-orders for tomorrow are available.`;

  return {
    isOpen,
    currentAccraTime: timeString,
    currentAccraDisplay: displayTime,
    openingTime: cleanOpen,
    closingTime: cleanClose,
    openingTimeDisplay: openDisplay,
    closingTimeDisplay: closeDisplay,
    message,
  };
}


/**
 * Reusable formatting composable adhering to AGENTS.md
 * Eliminates need for $formatMoney, $formatDate, etc. in globalProperties
 */

export function useFormatters() {
  function formatMoney(amount) {
    if (amount === null || amount === undefined || amount === "") return "0 so'm";
    const num = Math.round(Number(amount));
    if (isNaN(num)) return "0 so'm";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  }

  function formatDate(dateInput, fallback = "-") {
    if (!dateInput) return fallback;
    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) return String(dateInput);

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}.${month}.${year}`;
    } catch {
      return fallback;
    }
  }

  function formatPhone(phone) {
    if (!phone) return "";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 12 && clean.startsWith("998")) {
      const code = clean.slice(3, 5);
      const p1 = clean.slice(5, 8);
      const p2 = clean.slice(8, 10);
      const p3 = clean.slice(10, 12);
      return `+998 (${code}) ${p1}-${p2}-${p3}`;
    }
    return phone;
  }

  function getInitials(name) {
    if (!name) return "OQ";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  return {
    formatMoney,
    formatDate,
    formatPhone,
    getInitials,
  };
}

export default useFormatters;

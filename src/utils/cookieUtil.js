export const CookieUtils = {
  getCookie(name) {
    if (typeof document === "undefined" || !document.cookie) return "";

    const cookieName = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split("; ");
    const match = cookies.find((item) => item.startsWith(cookieName));
    if (!match) return "";

    return decodeURIComponent(match.slice(cookieName.length));
  }
};

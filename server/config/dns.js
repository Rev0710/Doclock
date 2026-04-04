const dns = require("dns");

/**
 * Atlas `mongodb+srv://` URIs need SRV DNS lookups. On some Windows setups the default
 * resolver returns errors for those queries while other apps still work. Pointing Node at
 * public DNS for this process fixes that. Set MONGO_DNS_USE_SYSTEM=true to skip.
 */
function applyMongoDnsWorkaround() {
  dns.setDefaultResultOrder("ipv4first");
  if (process.env.MONGO_DNS_USE_SYSTEM === "true") return;

  const preferPublicDns =
    process.platform === "win32" || process.env.MONGO_DNS_USE_PUBLIC === "true";
  if (preferPublicDns) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

module.exports = { applyMongoDnsWorkaround };

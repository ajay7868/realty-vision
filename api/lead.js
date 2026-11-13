// Vercel serverless function: secure lead capture.
// Configure HUBSPOT_ACCESS_TOKEN, RESEND_API_KEY and RESEND_FROM_EMAIL in Vercel.
const json = (res, status, body) => res.status(status).setHeader("Content-Type", "application/json").json(body);
const clean = (v, max = 500) => String(v || "").trim().slice(0, max);
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });
  const origin = req.headers.origin || "";
  const allowed = (process.env.LEAD_ALLOWED_ORIGINS || "https://vks-realty-2-0.vercel.app").split(",").map(s => s.trim());
  if (origin && !allowed.includes(origin)) return json(res, 403, { ok: false, error: "Origin not allowed" });
  const { name, phone, email, project, message, website } = req.body || {};
  // Quiet honeypot: bots fill this hidden field; accept without processing.
  if (website) return json(res, 200, { ok: true });
  const lead = {
    name: clean(name, 100), phone: clean(phone, 30),
    email: clean(email, 254).toLowerCase(), project: clean(project, 120),
    message: clean(message, 2000)
  };
  if (!lead.name || !lead.phone || !/^\+?[0-9 ()-]{7,20}$/.test(lead.phone) ||
      (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))) {
    return json(res, 400, { ok: false, error: "Please check your name, phone number and email." });
  }
  const tasks = [];
  if (process.env.HUBSPOT_ACCESS_TOKEN) {
    tasks.push((async () => {
      const headers = { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" };
      let contactId = null;
      if (lead.email) {
        const lookup = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(lead.email)}?idProperty=email&properties=email`, { headers });
        if (lookup.ok) contactId = (await lookup.json()).id;
      }
      const parts = lead.name.split(/\s+/);
      const properties = { firstname: parts[0], lastname: parts.slice(1).join(" "), phone: lead.phone, lifecyclestage: "lead" };
      if (lead.email) properties.email = lead.email;
      const endpoint = contactId
        ? `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`
        : "https://api.hubapi.com/crm/v3/objects/contacts";
      const saved = await fetch(endpoint, { method: contactId ? "PATCH" : "POST", headers, body: JSON.stringify({ properties }) });
      if (!saved.ok) throw new Error(`HubSpot contact save failed (${saved.status})`);
      const contact = await saved.json();
      const noteBody = [`Website enquiry: ${lead.project || "General enquiry"}`, `Phone: ${lead.phone}`, `Email: ${lead.email || "Not provided"}`, `Message: ${lead.message || "Not provided"}`].join("\\n");
      const note = await fetch("https://api.hubapi.com/crm/v3/objects/notes", { method: "POST", headers, body: JSON.stringify({
        properties: { hs_note_body: noteBody, hs_timestamp: new Date().toISOString() },
        associations: [{ to: { id: contact.id }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }] }]
      }) });
      if (!note.ok) throw new Error(`HubSpot note save failed (${note.status})`);
      return "crm";
    })());
  }
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    tasks.push((async () => {
      const html = `<h2>New VKS Realty website enquiry</h2><p><b>Name:</b> ${lead.name.replace(/[&<>"]/g, "")}</p><p><b>Phone:</b> ${lead.phone.replace(/[&<>"]/g, "")}</p><p><b>Email:</b> ${(lead.email || "Not provided").replace(/[&<>"]/g, "")}</p><p><b>Project:</b> ${(lead.project || "General").replace(/[&<>"]/g, "")}</p><p><b>Message:</b> ${(lead.message || "Not provided").replace(/[&<>"]/g, "")}</p>`;
      const sent = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL, to: ["sales@vksrealtygroup.com"], subject: `New website enquiry — ${lead.project || "VKS Realty"}`, html
      }) });
      if (!sent.ok) throw new Error(`Email notification failed (${sent.status})`);
      return "email";
    })());
  }
  if (!tasks.length) return json(res, 503, { ok: false, error: "Lead capture is not configured yet." });
  const outcomes = await Promise.allSettled(tasks);
  const succeeded = outcomes.filter(x => x.status === "fulfilled").map(x => x.value);
  const failed = outcomes.filter(x => x.status === "rejected");
  if (!succeeded.length) return json(res, 502, { ok: false, error: "We couldn't submit your enquiry. Please call the sales team." });
  return json(res, 200, { ok: true, savedTo: succeeded, partial: failed.length > 0 });
};

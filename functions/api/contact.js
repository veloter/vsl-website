/**
 * Cloudflare Pages Function: /api/contact
 * Handles dynamic contact form submissions on Cloudflare Pages.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const data = await request.json();
    const { name, email, service, budget, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields (name, email, or message)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check for Web3Forms Access Key in Cloudflare Environment Variables
    const web3Key = env.WEB3FORMS_ACCESS_KEY || env.WEB3FORMS_KEY;
    if (web3Key) {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3Key,
          from_name: "Veloter Software Lab Lead",
          subject: `New Lead: ${service || 'General'} - ${name}`,
          name: name,
          email: email,
          service: service || "Not specified",
          budget: budget || "Not specified",
          message: message
        })
      });

      const resData = await res.json();
      return new Response(JSON.stringify(resData), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Check for Resend API Key in Cloudflare Environment Variables
    const resendKey = env.RESEND_API_KEY;
    if (resendKey) {
      const targetEmail = env.CONTACT_EMAIL || "veloterlabs@gmail.com";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "VSL Inquiries <onboarding@resend.dev>",
          to: [targetEmail],
          reply_to: email,
          subject: `New Project Inquiry: ${service} (${name})`,
          text: `Name: ${name}\nEmail: ${email}\nService: ${service}\nBudget: ${budget}\n\nProject Brief:\n${message}`
        })
      });

      const resData = await res.json();
      return new Response(JSON.stringify({ success: res.ok, data: resData }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Fallback when neither key is yet configured
    return new Response(
      JSON.stringify({
        success: false,
        fallback: true,
        message: "No email key configured in Cloudflare environment variables."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

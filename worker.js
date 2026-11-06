export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle contact form submission
    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { name, email, service, budget, message } = data;

        if (!name || !email || !message) {
          return new Response(
            JSON.stringify({ success: false, message: "Please fill in all required fields." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        const accessKey = env.WEB3FORMS_ACCESS_KEY || env.WEB3FORMS_KEY || "583297e4-5ec3-4150-9c19-effa43299230";

        const web3Res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: accessKey,
            from_name: "Veloter Software Lab Inquiries",
            subject: `New Lead: ${service || 'General'} from ${name}`,
            name: name,
            email: email,
            service: service || "Not specified",
            budget: budget || "Not specified",
            message: message
          })
        });

        const result = await web3Res.json();
        return new Response(JSON.stringify(result), {
          status: web3Res.status,
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ success: false, message: err.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Serve static assets for all other routes
    return env.ASSETS.fetch(request);
  }
};

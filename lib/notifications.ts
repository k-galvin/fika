import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const ADMIN_EMAIL = "katemgalvin@gmail.com";

interface NotificationParams {
  type: "suggestion" | "photo" | "update";
  details: string;
  count?: number;
}

export async function sendAdminNotification({ type, details, count }: NotificationParams) {
  if (!resend) {
    console.error("NOTIFICATION ERROR: RESEND_API_KEY is not set. Cannot send admin notification.");
    return;
  }

  const subjectMap = {
    suggestion: "New Cafe Suggestion ☕",
    photo: `New Photo${(count || 1) > 1 ? "s" : ""} for Review 📸`,
    update: "New Cafe Update Requested 📝",
  };

  try {
    console.log(`Attempting to send admin notification: ${type} - ${details}`);
    
    const { data, error } = await resend.emails.send({
      from: "Fika App <notifications@resend.dev>",
      to: ADMIN_EMAIL,
      subject: subjectMap[type],
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #6366f1;">Hello Admin!</h2>
          <p>You have a new item to review on the Fika Admin Dashboard.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <strong>Type:</strong> ${type.toUpperCase()}<br/>
            <strong>Details:</strong> ${details}
            ${count && count > 1 ? `<br/><strong>Count:</strong> ${count}` : ""}
          </div>
          <a 
            href="https://findyourfika.vercel.app/admin" 
            style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;"
          >
            Open Admin Dashboard
          </a>
          <p style="font-size: 12px; color: #6b7280; margin-top: 32px;">
            This is an automated notification from your Fika App.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error sending admin notification:", error);
    } else {
      console.log("Admin notification sent successfully. ID:", data?.id);
    }
  } catch (err) {
    console.error("Unexpected error in sendAdminNotification:", err);
  }
}


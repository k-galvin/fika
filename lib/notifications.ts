import { Resend } from "resend";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";

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
    console.warn("RESEND_API_KEY is not set. Admin notification skipped.");
    return;
  }

  const subjectMap = {
    suggestion: "New Cafe Suggestion ☕",
    photo: `New Photo${(count || 1) > 1 ? "s" : ""} for Review 📸`,
    update: "New Cafe Update Requested 📝",
  };

  try {
    const { error } = await resend.emails.send({
      from: "Fika App <notifications@resend.dev>", // Replace with your domain if configured
      to: ADMIN_EMAIL,
      subject: subjectMap[type],
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #6366f1;">Hello Admin!</h2>
          <p>You have a new item to review on the Fika Admin Dashboard.</p>
          <div style="background-color: #f3f4f6; padding: 16px; rounded-lg; margin: 16px 0;">
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
      console.error("Error sending admin notification email:", error);
    }
  } catch (err) {
    console.error("Unexpected error sending email:", err);
  }
}

export async function sendFriendRequestNotification(recipientId: string, senderUsername: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Friend request notification skipped.");
    return;
  }

  try {
    const adminSupabase = createServiceRoleClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(recipientId);

    if (userError || !user?.email) {
      console.error("Error fetching recipient email for friend request notification:", userError);
      return;
    }

    const { error } = await resend.emails.send({
      from: "Fika App <notifications@resend.dev>",
      to: user.email,
      subject: `New Friend Request from ${senderUsername} ☕`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #6366f1;">Hello!</h2>
          <p><strong>${senderUsername}</strong> sent you a friend request on Fika.</p>
          <p>Connect with them to see their favorite cafes and recent visits!</p>
          <div style="margin: 24px 0;">
            <a 
              href="https://findyourfika.vercel.app/profile" 
              style="display: inline-block; background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;"
            >
              View Friend Request
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 32px;">
            You can manage your friend requests in your profile settings.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending friend request notification email:", error);
    }
  } catch (err) {
    console.error("Unexpected error sending friend request email:", err);
  }
}

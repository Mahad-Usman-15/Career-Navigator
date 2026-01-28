import { Resend } from 'resend';
import EmailTemplate from '../../../components/emailtemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, contactNumber, reason } = await request.json();

    if (!name || !email || !contactNumber || !reason) {
      return new Response(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400 }
      );
    }

    // Use Resend React email rendering directly
    const { data, error } = await resend.emails.send({
      from: 'Your Company <onboarding@yourdomain.com>',
      to: ['mahadusman2008@gmail.com'],
      subject: 'New Contact Form Submission',
      react: EmailTemplate({
        name,
        email,
        contactNumber,
        reason,
      }), // Pass JSX, NOT HTML
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while sending the email.' }),
      { status: 500 }
    );
  }
}

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
      to: "mahadusman2008@gmail.com",  // Your email
      from: "onboarding@resend.dev",
      subject: 'New Contact Form Submission',
      html: `<p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Contact Number:</strong> ${contactNumber}</p>
    <p><strong>Reason:</strong> ${reason}</p>`
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

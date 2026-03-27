// app/components/EmailTemplate.js
import React from 'react';

const EmailTemplate = ({ name, email, contactNumber, reason }) => (
  <div>
    <h1>Contact Form Submission</h1>
    <p><strong>Name:</strong> {name}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Contact Number:</strong> {contactNumber}</p>
    <p><strong>Reason:</strong> {reason}</p>
  </div>
);

// T040: Career report ready email variant
export const CareerReportEmailTemplate = ({ firstName, dashboardUrl }) => (
  <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '24px', backgroundColor: '#171717', color: '#ffffff' }}>
    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', background: 'linear-gradient(to right, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      Your Career Report is Ready
    </h1>
    <p style={{ color: '#d1d5db', marginBottom: '12px' }}>
      Hi {firstName ?? 'there'},
    </p>
    <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
      Your AI-powered career guidance report has been generated. It includes your top career path matches, skill gap analysis, and a personalised roadmap to get you there.
    </p>
    <a
      href={dashboardUrl}
      style={{ display: 'inline-block', padding: '12px 24px', borderRadius: '8px', backgroundColor: '#3b82f6', color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}
    >
      View Your Report →
    </a>
    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '32px' }}>
      Career Navigator · Karachi, Pakistan
    </p>
  </div>
);

export default EmailTemplate;
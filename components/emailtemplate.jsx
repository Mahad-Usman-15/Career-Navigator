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

export default EmailTemplate;
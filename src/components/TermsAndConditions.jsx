import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8 mb-8">
      <h1 className="text-2xl font-bold mb-4 text-[#2c5e4a]">Terms &amp; Conditions</h1>
      <p className="mb-4 text-gray-700">
        Welcome to NomadNova! Please read these terms and conditions carefully before using our platform.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">1. Acceptance of Terms</h2>
      <p className="mb-4 text-gray-700">
        By accessing or using NomadNova, you agree to be bound by these terms and all applicable laws and regulations.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">2. User Accounts</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>You must provide accurate information when creating an account.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>NomadNova reserves the right to suspend or terminate accounts at its discretion.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">3. Trip Participation</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>All trips are subject to availability and may be changed or canceled at any time.</li>
        <li>Participants must comply with all trip guidelines and local laws.</li>
        <li>NomadNova is not responsible for personal belongings or travel delays.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">4. Content & Conduct</h2>
      <ul className="list-disc pl-6 mb-4 text-gray-700">
        <li>Users may not post offensive, illegal, or infringing content.</li>
        <li>Respect other members and maintain a friendly community environment.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">5. Liability</h2>
      <p className="mb-4 text-gray-700">
        NomadNova is not liable for any direct, indirect, or incidental damages arising from your use of the platform.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">6. Changes to Terms</h2>
      <p className="mb-4 text-gray-700">
        We may update these terms at any time. Continued use of the platform constitutes acceptance of the new terms.
      </p>
      <h2 className="text-lg font-semibold mt-6 mb-2 text-[#2c5e4a]">7. Contact Us</h2>
      <p className="mb-4 text-gray-700">
        If you have any questions about these Terms &amp; Conditions, please contact us at <a href="mailto:support@nomadnova.com" className="text-[#2c5e4a] underline">support@nomadnova.com</a>.
      </p>
      <div className="text-xs text-gray-400 mt-8">
        Last updated: June 28, 2025
      </div>
    </div>
  );
}
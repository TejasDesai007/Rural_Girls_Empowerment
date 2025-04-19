import React from "react";

const Footer = () => {
  return (
    <footer className="px-6 py-8 bg-white border-t text-center text-sm text-gray-500">
      <div className="flex justify-center gap-6 mb-2">
        <a href="/about" className="hover:underline">About</a>
        <a href="/privacy-terms" className="hover:underline">Privacy Policy</a>
      </div>

      <p className="mt-4 text-xs">Built in collaboration with Google by Team DevRangers</p>
      <p className="mt-1">© 2025 Rural Empower. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
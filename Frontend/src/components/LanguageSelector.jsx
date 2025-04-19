// src/components/LanguageSelector.jsx
import React, { useContext } from "react";
import { LanguageContext } from "../LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  return (
    <div style={{ padding: "10px" }}>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
        <option value="gu">Gujarati</option>
        <option value="ta">Tamil</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

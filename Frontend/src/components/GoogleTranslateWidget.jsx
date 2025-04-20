import { useEffect } from "react";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";

const GoogleTranslateWidget = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (document.getElementById("google-translate-script")) return;

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr,fr,es,ta,te,ur,bn", // Customize this list
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      };
    };

    addGoogleTranslateScript();
  }, []);

  const handleTranslateClick = () => {
    const element = document.getElementById("google_translate_element");
    
    // Toggle visibility
    if (element) {
      if (element.style.display === "none" || element.style.display === "") {
        element.style.display = "block"; // Show the widget
      } else {
        element.style.display = "none"; // Hide the widget
      }
    }
  };

  return (
    <div>
      {/* Custom Button with imported HoverBorderGradient */}
      <div className="fixed bottom-6 right-6 z-50">
        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          className="bg-white text-black flex items-center space-x-2"
          onClick={handleTranslateClick}
        >
          <img
            src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png"
            alt="Google Logo"
            className="w-6 h-6"
          />
          <span className="font-medium text-sm">Translate</span>
        </HoverBorderGradient>
      </div>

      {/* Google Translate Widget (conditionally rendered) */}
      <div
        id="google_translate_element"
        style={{
          position: "fixed",
          bottom: "70px", // Adjusted to avoid overlap with the button
          right: "20px",
          zIndex: 9999,
          width: "auto",
          minWidth: "120px",
          maxWidth: "180px",
          height: "auto",
          maxHeight: "auto",
          overflow: "hidden",
          display: "none", // Hidden by default
        }}
      />
    </div>
  );
};

export default GoogleTranslateWidget;
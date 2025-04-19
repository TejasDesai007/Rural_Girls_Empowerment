import React from "react";

function DownloadFile() {
  const fileUrl = "https://res.cloudinary.com/dczpxrdq1/raw/upload/v1744986587/h85d4t0plld3ucwwufsu.pdf"; // The raw URL to your file

  return (
    <div>
      <a href={fileUrl} download>
        <button>Download File</button>
      </a>
    </div>
  );
}

export default DownloadFile;

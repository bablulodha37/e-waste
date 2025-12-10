// src/components/CopyrightBar.js

import React from "react";
import "../css/Footer.css"; // Footer.css का उपयोग स्टाइलिंग के लिए कर सकते हैं

export default function CopyrightBar() {
    return (
        // हम वही क्लासनेम 'footer-bottom' उपयोग कर रहे हैं जो पहले Footer में था
        <div className="footer-bottom">
            {/* वर्तमान वर्ष (2025 नहीं) के लिए dynamic code का उपयोग करें */}
            <p>&copy; {new Date().getFullYear()} EcoSaathi. All rights reserved.</p>
        </div>
    );
}
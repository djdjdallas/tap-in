"use client";

// Mobile-friendly error debugging
export function initMobileDebugger() {
  if (typeof window !== "undefined") {
    window.onerror = function (message, source, lineno, colno, error) {
      // Create a visible error display for mobile debugging
      const errorDiv = document.createElement("div");
      errorDiv.style.position = "fixed";
      errorDiv.style.bottom = "0";
      errorDiv.style.left = "0";
      errorDiv.style.right = "0";
      errorDiv.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
      errorDiv.style.color = "white";
      errorDiv.style.padding = "10px";
      errorDiv.style.zIndex = "9999";
      errorDiv.style.fontSize = "12px";
      errorDiv.style.maxHeight = "50vh";
      errorDiv.style.overflow = "auto";

      errorDiv.innerHTML = `
        <strong>Error:</strong> ${message}<br>
        <strong>Source:</strong> ${source}<br>
        <strong>Line:</strong> ${lineno}:${colno}<br>
        <strong>Stack:</strong> ${
          error && error.stack
            ? error.stack.replace(/\n/g, "<br>")
            : "No stack trace available"
        }
      `;

      document.body.appendChild(errorDiv);

      // Remove after 30 seconds
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 30000);

      // Return false to allow the default error handling
      return false;
    };

    // Also catch unhandled promise rejections
    window.addEventListener("unhandledrejection", function (event) {
      console.error("Unhandled Promise Rejection:", event.reason);
    });
  }
}

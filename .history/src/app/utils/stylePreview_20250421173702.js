"use client";

import React from "react";
import { isCustomColor, extractCustomColor } from "./color-utils";

// Preview card that shows how selected styles will look
const StylePreview = ({ customization, backgroundImage }) => {
  // Extract background and text styles
  const bgStyle = isCustomColor(customization.profile_bg_color)
    ? { backgroundColor: extractCustomColor(customization.profile_bg_color) }
    : {};

  const textStyle = isCustomColor(customization.profile_text_color)
    ? { color: extractCustomColor(customization.profile_text_color) }
    : {};

  const buttonBgStyle = isCustomColor(customization.button_bg_color)
    ? { backgroundColor: extractCustomColor(customization.button_bg_color) }
    : {};

  const buttonTextStyle = isCustomColor(customization.button_text_color)
    ? { color: extractCustomColor(customization.button_text_color) }
    : {};

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
      </div>
      <div
        className={`p-6 ${
          backgroundImage
            ? ""
            : !isCustomColor(customization.profile_bg_color)
            ? customization.profile_bg_color
            : ""
        }`}
        style={{
          ...(backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }
            : bgStyle),
        }}
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            style={{ zIndex: 0 }}
          />
        )}
        <div className="relative z-10">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full mb-2 flex items-center justify-center text-white">
              <span>Avatar</span>
            </div>
            <h3
              className={`text-lg font-bold ${
                backgroundImage
                  ? "text-white"
                  : !isCustomColor(customization.profile_text_color)
                  ? customization.profile_text_color
                  : ""
              }`}
              style={backgroundImage ? {} : textStyle}
            >
              Profile Name
            </h3>
            <p
              className={`text-sm ${
                backgroundImage
                  ? "text-white"
                  : !isCustomColor(customization.profile_text_color)
                  ? customization.profile_text_color
                  : ""
              }`}
              style={backgroundImage ? {} : textStyle}
            >
              Your Title Goes Here
            </p>
          </div>
          <div className="mt-4">
            <div
              className={`p-3 ${
                !isCustomColor(customization.button_bg_color)
                  ? customization.button_bg_color
                  : ""
              } rounded-lg flex items-center justify-between mb-2`}
              style={buttonBgStyle}
            >
              <span
                className={`${
                  !isCustomColor(customization.button_text_color)
                    ? customization.button_text_color
                    : ""
                }`}
                style={buttonTextStyle}
              >
                Sample Link
              </span>
              <span
                className={`${
                  !isCustomColor(customization.button_text_color)
                    ? customization.button_text_color
                    : ""
                }`}
                style={buttonTextStyle}
              >
                →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylePreview;

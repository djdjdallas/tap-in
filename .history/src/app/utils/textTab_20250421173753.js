"use client";

import React from "react";
import { ColorOptionButton, ColorPickerOption } from "./color-components";
import { colorOptions } from "./color-utils";

const TextTab = ({ customization, setCustomization }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">
          Profile Text Color
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colorOptions.textColors.map((option) => (
            <ColorOptionButton
              key={option.value}
              label={option.label}
              value={option.value}
              selectedValue={customization.profile_text_color}
              onChange={(value) =>
                setCustomization((prev) => ({
                  ...prev,
                  profile_text_color: value,
                }))
              }
              type="profile_text_color"
            />
          ))}

          {/* Add color picker option */}
          <ColorPickerOption
            type="profile_text_color"
            customization={customization}
            setCustomization={setCustomization}
          />
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">
          Button Text Color
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colorOptions.textColors.map((option) => (
            <ColorOptionButton
              key={option.value}
              label={option.label}
              value={option.value}
              selectedValue={customization.button_text_color}
              onChange={(value) =>
                setCustomization((prev) => ({
                  ...prev,
                  button_text_color: value,
                }))
              }
              type="button_text_color"
            />
          ))}

          {/* Add color picker option */}
          <ColorPickerOption
            type="button_text_color"
            customization={customization}
            setCustomization={setCustomization}
          />
        </div>
      </div>
    </div>
  );
};

export default TextTab;

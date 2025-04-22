"use client";

import React from "react";
import { ColorOptionButton, ColorPickerOption } from "./color-components";
import { colorOptions } from "./color-utils";

const ButtonsTab = ({ customization, setCustomization }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">
          Button Background Colors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colorOptions.buttonBackgrounds.map((option) => (
            <ColorOptionButton
              key={option.value}
              label={option.label}
              value={option.value}
              selectedValue={customization.button_bg_color}
              onChange={(value) =>
                setCustomization((prev) => ({
                  ...prev,
                  button_bg_color: value,
                }))
              }
              type="button_bg_color"
            />
          ))}

          {/* Add color picker option */}
          <ColorPickerOption
            type="button_bg_color"
            customization={customization}
            setCustomization={setCustomization}
          />
        </div>
      </div>
    </div>
  );
};

export default ButtonsTab;

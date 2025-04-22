"use client";

import React, { useState } from "react";
import { CheckCircle, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { extractCustomColor, cssColorToTailwindClass } from "./color-utils";

// Custom color picker component
export const ColorPicker = ({ currentColor, onChange, type }) => {
  const [color, setColor] = useState(extractCustomColor(currentColor));

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);

    // Create custom tailwind class with the selected color
    const newTailwindClass = cssColorToTailwindClass(newColor, type);
    onChange(newTailwindClass);
  };

  return (
    <div className="p-2">
      <div className="mb-2 text-sm font-medium">Pick a Custom Color</div>
      <div className="flex items-center gap-3">
        <div className="relative w-40 h-10">
          <input
            type="color"
            value={color}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full rounded-md border border-gray-300"
            style={{ backgroundColor: color }}
          ></div>
        </div>
        <div className="text-sm font-mono">{color}</div>
      </div>
    </div>
  );
};

export const ColorOptionButton = ({
  label,
  value,
  selectedValue,
  onChange,
  type,
}) => (
  <button
    type="button"
    onClick={() => onChange(value)}
    className={`flex items-center justify-between px-4 py-3 rounded-md ${value} ${
      selectedValue === value
        ? "ring-2 ring-blue-500 ring-offset-2"
        : "border border-gray-200 hover:border-gray-300"
    } transition-all duration-200`}
  >
    <span className="font-medium">{label}</span>
    {selectedValue === value && (
      <CheckCircle className="w-5 h-5 text-blue-500" />
    )}
  </button>
);

// Color picker option component (to add at the end of each color section)
export const ColorPickerOption = ({
  type,
  customization,
  setCustomization,
}) => {
  const currentValue = customization[type];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-full flex flex-col items-center justify-center p-3 gap-2 border border-dashed border-gray-300 hover:border-gray-400"
        >
          <Palette className="h-6 w-6 text-gray-400" />
          <span className="text-sm text-gray-500">Custom Color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <ColorPicker
          currentColor={currentValue}
          onChange={(value) =>
            setCustomization((prev) => ({ ...prev, [type]: value }))
          }
          type={type}
        />
      </PopoverContent>
    </Popover>
  );
};

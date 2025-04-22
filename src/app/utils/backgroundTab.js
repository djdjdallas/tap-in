"use client";

import React from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorOptionButton, ColorPickerOption } from "./color-components";
import { colorOptions } from "./color-utils";

const BackgroundTab = ({
  user,
  backgroundImage,
  isCheckingBackground,
  isUpdating,
  handleRemoveImage,
  handleImageUpload,
  customization,
  setCustomization,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-700">
            Profile Background
          </h3>
          {backgroundImage && !isCheckingBackground && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="text-red-500 hover:text-red-600"
              disabled={isUpdating}
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUpdating || isCheckingBackground}
            />
            <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm text-center text-gray-500">
              {isCheckingBackground ? "Checking..." : "Upload Background Image"}
            </span>
          </label>

          {colorOptions.cardBackgrounds.map((option) => (
            <ColorOptionButton
              key={option.value}
              label={option.label}
              value={option.value}
              selectedValue={customization.profile_bg_color}
              onChange={(value) =>
                setCustomization((prev) => ({
                  ...prev,
                  profile_bg_color: value,
                }))
              }
              type="profile_bg_color"
            />
          ))}

          {/* Add color picker option */}
          <ColorPickerOption
            type="profile_bg_color"
            customization={customization}
            setCustomization={setCustomization}
          />
        </div>

        {backgroundImage && !isCheckingBackground && (
          <div className="mt-4">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={backgroundImage}
                alt="Background Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image failed to load:", backgroundImage);
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                  e.target.parentNode.classList.add("bg-gray-200");
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <span className="text-white text-sm font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                  Current Background
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundTab;

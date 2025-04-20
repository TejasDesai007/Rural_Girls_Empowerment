import React from "react";
import { cn } from "@/lib/utils";

export const HoverEffect = ({ 
  items, 
  className,
  render
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="relative group block p-6 bg-white rounded-xl h-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
        >
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 absolute inset-0 rounded-xl z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative z-10 h-full">
            {render ? render(item) : (
              <div className="h-full">
                <h2 className="font-bold text-lg text-gray-800 mb-2">{item.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
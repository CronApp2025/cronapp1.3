import React from "react";
import { cn } from "@/lib/utils";

interface DividerWithTextProps {
  children: React.ReactNode;
  className?: string;
}

export function DividerWithText({ children, className }: DividerWithTextProps) {
  return (
    <div className={cn("relative w-full my-4", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-xs text-gray-500">{children}</span>
      </div>
    </div>
  );
}
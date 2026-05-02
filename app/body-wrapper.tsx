"use client";

import { ReactNode } from "react";
import { useTheme } from "./theme-context";
import clsx from "clsx";

type BodyWrapperProps = {
  children: ReactNode;
  karlaClassName: string;
  kateVariable: string;
};

export default function BodyWrapper({ children, karlaClassName, kateVariable }: BodyWrapperProps) {
  const { isAfterHours } = useTheme();

  return (
    <body
      className={clsx(
        `${karlaClassName} ${kateVariable} antialiased`,
        isAfterHours && "after-hours-theme"
      )}
    >
      {children}
    </body>
  );
}

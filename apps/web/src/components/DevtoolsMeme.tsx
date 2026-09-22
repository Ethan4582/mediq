"use client";

import { useEffect } from "react";

const MONO =
  "font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;";

export default function DevtoolsMeme() {
  useEffect(() => {
    console.log(
      "%cKYA DEKH RAHE HO?\n%c%s\n%c  inspector babu, welcome to the source.\n  koi secret nahi - bas bugs, chai aur thoda sa magic.\n  meme accha laga? feedback, roast ya shoutout - sab chalega.\n%c  → DM karo ya follow: x.com/ashirwadsingh_",
      `${MONO} font-size: 58px; line-height: 1.25; font-weight: 900; letter-spacing: 4px; color: #ffd21a; text-shadow: 0 1px 0 #f7b733, 0 2px 0 #f0a020, 0 3px 0 #ef8e1b, 0 4px 0 #d97a10, 0 5px 0 #c96a10, 0 6px 0 #b45309, 0 7px 0 #92400e, 0 8px 0 #78350f, 0 10px 14px rgba(201, 106, 16, 0.6), 0 14px 24px rgba(120, 53, 15, 0.45);`,
      `${MONO} font-size: 12px; line-height: 0.6; color: #ef8e1b;`,
      "─".repeat(70),
      `${MONO} font-size: 12px; line-height: 1.8; font-weight: 500; color: #d4d4d4;`,
      `${MONO} font-size: 12px; line-height: 1.8; font-weight: 700; color: #ffd21a;`
    );
  }, []);

  return null;
}

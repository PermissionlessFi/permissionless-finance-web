/* Inline brand/utility glyphs. All use `currentColor` so they inherit text
 * color and adapt across the three themes. 24×24 viewBox, sized via `size`. */

export function XIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function GitHubIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function MailIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
      <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
    </svg>
  );
}

/* Generic line glyphs (stroke, not fill) for the Support page. */
function stroke(size: number, className: string, d: string) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {d.split("|").map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

export const BookIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) =>
  stroke(size, className, "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z|M18 3v18|M8 7h6|M8 10.5h6");

export const GlobeIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) =>
  stroke(size, className, "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M3 12h18|M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z");

export const HeartIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) =>
  stroke(size, className, "M12 20.5C6.5 16.5 3 13.2 3 9.3 3 6.8 5 5 7.4 5c1.7 0 3.3 1 3.7 2.3C11.6 6 13.2 5 14.9 5 17.3 5 19.3 6.8 19.3 9.3c0 3.9-3.5 7.2-9 11.2Z");

export const SparkIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) =>
  stroke(size, className, "M12 3v4|M12 17v4|M3 12h4|M17 12h4|M6.3 6.3l2.4 2.4|M15.3 15.3l2.4 2.4|M17.7 6.3l-2.4 2.4|M8.7 15.3l-2.4 2.4");

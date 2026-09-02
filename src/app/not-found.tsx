import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p
          className="text-6xl font-bold mb-4"
          style={{ fontFamily: "var(--font-heading)", color: "var(--theme-heading)" }}
        >
          404
        </p>
        <p className="mb-2" style={{ color: "var(--theme-text)" }}>
          页面不存在 · Page not found
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--theme-text-muted)" }}>
          这一页还没有被写进这本书。
        </p>
        <Link
          href="/"
          className="underline underline-offset-4 text-sm"
          style={{ color: "var(--theme-accent)" }}
        >
          返回首页 · Back to the book
        </Link>
      </div>
    </div>
  );
}

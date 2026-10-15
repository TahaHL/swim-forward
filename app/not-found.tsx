import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="information-page">
      <h1>This page isn’t here</h1>
      <p>Check the address or return to your account.</p>
      <Link href="/app" className="button primary">
        Open your account
      </Link>
    </main>
  );
}

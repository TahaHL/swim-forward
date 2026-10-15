import { notFound } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/core";
const pages: Record<string, { title: string; paragraphs: string[] }> = {
  "how-it-works": {
    title: "A focused plan. A clearer picture.",
    paragraphs: [
      "We start by understanding your child’s technique and choosing relevant development targets. Coaching happens in six-week blocks; families can continue with another block when places are available.",
      "After each published session, you see what went well, why a skill needs practice and the next target. Your child continues their usual swimming lessons alongside this coaching.",
    ],
  },
  "for-parents": {
    title: "Understand the little things that add up.",
    paragraphs: [
      "A rating alone cannot explain a swim. Your update connects each technique observation to a practical next target, in plain English.",
      "Your account shows only your linked children. Skills develop at different rates, and a rating need not change every week.",
    ],
  },
  programmes: {
    title: "Coaching that builds from here.",
    paragraphs: [
      "One-to-one and small-group coaching are organised in six-week blocks. Each child works on the most relevant skills for their development.",
      "Availability and prices are shown in your account when the next block opens. No places are currently advertised on this public page.",
    ],
  },
  about: {
    title: "Thoughtful coaching. Useful feedback.",
    paragraphs: [
      "Swim Forward is supplementary swimming coaching led by Taha, a qualified Level 2 swimming teacher in West London.",
      "The aim is to make technique feedback easier to understand, while respecting the work of your child’s regular lesson provider.",
    ],
  },
  faq: {
    title: "A few useful answers.",
    paragraphs: [
      "Does this replace regular lessons? No. Coaching is supplementary and works alongside them.",
      "Does a Pass award a swimming stage? No. It recognises one technique skill against the programme’s criteria.",
      "Does the programme end after six weeks? The booking unit is a six-week block. Coaching can continue through further blocks when available.",
    ],
  },
  contact: {
    title: "Talk to your coach.",
    paragraphs: [
      "Existing families can use the contact details provided with their programme information.",
      "Public contact details will be added by the owner before launch. This page does not send messages.",
    ],
  },
  privacy: {
    title: "Privacy notice — template for legal review",
    paragraphs: [
      "This is an unfinished template, not a final privacy notice or legal advice. The owner must provide controller identity and contact details, purposes and lawful bases, service providers and transfers, retention periods, rights and complaint routes before real registration opens.",
      "The application is designed to keep child records limited to linked parents and authorised coaching staff. It records assessments, session feedback and programme information. Internal teacher notes are held separately.",
      "Production use must remain closed until the owner’s legal and safeguarding launch gates are satisfied.",
    ],
  },
  terms: {
    title: "Terms — template for legal review",
    paragraphs: [
      "This is an unfinished template. A solicitor must review the service description, booking and cancellation rules, refunds, responsibilities, complaints and liability terms before paid bookings open.",
      "No promise of stage advancement or a particular rate of progress is made. Coaching supplements existing lessons and does not award official swimming stages.",
    ],
  },
};
export function generateStaticParams() {
  return Object.keys(pages).map((information) => ({ information }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ information: string }>;
}) {
  const { information } = await params;
  const page = pages[information];
  if (!page) notFound();
  return (
    <>
      <header className="public-header">
        <Brand />
        <Link href="/sign-in" className="button secondary">
          Sign in
        </Link>
      </header>
      <main className="information-page" id="main">
        <h1>{page.title}</h1>
        {page.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <Link className="button primary" href="/">
          Back to home
        </Link>
      </main>
    </>
  );
}

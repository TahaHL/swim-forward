import Link from "next/link";
import { Brand, Lane, StatusMark } from "@/components/core";
export default function Home() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <nav>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/programmes">Programmes</Link>
          <Link className="button secondary" href="/sign-in">
            Sign in
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className="public-hero">
          <div>
            <p className="muted">Focused coaching. Clear feedback.</p>
            <h1>
              Small details.
              <br />A clearer way forward.
            </h1>
            <p className="hero-description">
              See what your child is improving. Understand what still needs
              practice. Know what comes next.
            </p>
            <p>
              Supplementary swimming coaching that works alongside their regular
              lessons, with a plan shaped around them.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/how-it-works">
                How it works
              </Link>
              <Link className="button secondary" href="/demo">
                Explore the demonstration
              </Link>
            </div>
          </div>
          <div className="public-preview">
            <span className="demo-label">
              Example update · fictional swimmer
            </span>
            <h2>Oliver’s swimming</h2>
            <p className="muted">Week 3 of 6</p>
            <Lane week={3} />
            <h3>A steadier kick. A more confident swim.</h3>
            <p>Oliver kept his kick moving as he turned to breathe today.</p>
            <div className="list-row">
              <span>Kick from the hips</span>
              <StatusMark value="good" />
            </div>
            <div className="focus-panel">
              <span className="focus-marker" />
              <div>
                <h3>The next focus</h3>
                <p>Relax the ankles when the arms start moving.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="public-explainer">
          <h2>The lesson is only part of the story.</h2>
          <div>
            <article>
              <span className="step-number">01</span>
              <h3>A starting point</h3>
              <p>
                Your coach identifies the technique details that will make the
                most useful focus for your child.
              </p>
            </article>
            <article>
              <span className="step-number">02</span>
              <h3>Focused coaching</h3>
              <p>
                One-to-one or small-group sessions, organised in six-week blocks
                alongside regular lessons.
              </p>
            </article>
            <article>
              <span className="step-number">03</span>
              <h3>Progress you understand</h3>
              <p>
                Short updates explain what improved, what needs practice and the
                next target.
              </p>
            </article>
          </div>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <nav>
          {["for-parents", "about", "faq", "contact", "privacy", "terms"].map(
            (p) => (
              <Link href={"/" + p} key={p}>
                {p.replaceAll("-", " ")}
              </Link>
            ),
          )}
        </nav>
        <p>
          Supplementary technique coaching. Individual skill ratings are not
          official swimming-stage awards.
        </p>
      </footer>
    </>
  );
}

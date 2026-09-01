export default function Home() {
  return (
    <main className="av-main">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <p className="sub">
          <span className="neon-cyan">PORTAL RETRO</span>{" "}
          <span className="blink">_</span>
        </p>
      </section>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
        <button className="btn">JUGAR AHORA</button>
        <button className="btn magenta">VER SALÓN</button>
        <button className="btn ghost">INICIAR SESIÓN</button>
      </div>
    </main>
  );
}

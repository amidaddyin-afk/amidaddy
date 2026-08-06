export default function Loading() {
  return (
    <main className="route-loading" aria-label="Loading Amidaddy">
      <div className="loading-frame" aria-hidden="true">
        <p className="loading-mark">AMIDADDY</p>
        <div className="loading-line" />
        <div className="loading-grid">
          <div className="loading-block" />
          <div className="loading-block" />
          <div className="loading-block" />
        </div>
      </div>
      <span className="sr-only">Loading the collection…</span>
    </main>
  );
}

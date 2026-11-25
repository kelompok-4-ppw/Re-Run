export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-dark-navy)', color: '#fff', padding: '48px 0 24px', marginTop: '80px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>RE-RUN</h4>
          <p style={{ color: '#CBD5E1', fontSize: '14px', maxWidth: '340px' }}>
            Discover timeless styles and explore curated fashion pieces that deserve another story.
          </p>
        </div>
        <div style={{ fontSize: '14px', color: '#CBD5E1' }}>
          <p>React.js Front-end &bull; Laravel REST API</p>
          <p style={{ marginTop: '8px', color: '#94A3B8' }}>&copy; 2026 Re-Run Application — Kelompok 4 PPW UNJ</p>
        </div>
      </div>
    </footer>
  );
}
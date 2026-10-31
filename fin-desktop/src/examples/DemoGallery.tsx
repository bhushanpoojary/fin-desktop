/**
 * DemoGallery — a full-page index of every built-in demo, grouped by category. Reachable at
 * ?test=demos and from the floating Demo Launcher. Route: ?test=demos.
 */

import React from 'react';
import { DEMOS, DEMO_CATEGORIES, gotoDemo } from './demoRegistry';
import './DemoGallery.css';

export const DemoGallery: React.FC = () => (
  <div className="gallery">
    <header className="gallery-head">
      <div>
        <h1>FinDesktop Demos</h1>
        <p>Every built-in demo in one place. Click a card to open it; use the ✦ launcher (bottom-right) to jump between them from anywhere.</p>
      </div>
      <button className="gallery-home" onClick={() => gotoDemo('home')}>
        ⌂ Workspace
      </button>
    </header>

    {DEMO_CATEGORIES.map((category) => (
      <section key={category} className="gallery-section">
        <h2>{category}</h2>
        <div className="gallery-grid">
          {DEMOS.filter((d) => d.category === category).map((demo) => (
            <button key={demo.id} className="gallery-card" onClick={() => gotoDemo(demo.id)}>
              <span className="gallery-card-icon">{demo.icon}</span>
              <span className="gallery-card-title">{demo.title}</span>
              <span className="gallery-card-desc">{demo.description}</span>
              <span className="gallery-card-route">?test={demo.id}</span>
            </button>
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default DemoGallery;

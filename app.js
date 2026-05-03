/**
 * logo.js — PyLaunch logo, paths taken verbatim from the original SVG.
 * Color reacts to the active theme via CSS variables.
 */
const Logo = {
  // Four paths copied verbatim from image__2_.svg (viewBox 0 0 296.98 300)
  _d: [
    "M161.4461,155.39502c4.27673,4.03125 8.77909,8.73926 12.96644,12.92725l24.72268,24.71924l63.53263,63.55518c-5.30818,5.29541 -11.30937,9.10547 -18.58377,11.09912c-19.67529,-16.021 -43.18923,-26.63379 -68.22106,-30.78955c-7.76521,-1.28174 -14.40667,-1.77539 -22.20558,-1.94531c-34.29543,-0.5083 -67.67368,11.07715 -94.27452,32.72461c-2.54391,-0.70166 -5.01325,-1.65088 -7.373,-2.83301c4.03058,-4.1792 8.42833,-8.44482 12.54785,-12.56543l24.23171,-24.23145z",
    "M261.25106,36.12773c0.71352,0.36665 2.12298,2.01577 2.68413,2.67847c3.78884,4.47363 7.06048,10.12676 8.4758,15.85342c-17.57575,21.62021 -28.60236,47.8144 -31.77877,75.49351c-4.57122,39.90059 6.85976,77.84883 31.77877,109.19355c-0.56554,2.46826 -1.76402,5.09912 -2.78815,7.41943c-3.698,-3.84961 -7.74031,-7.771 -11.52914,-11.55908l-21.37045,-21.36035l-76.59137,-76.62012c5.13676,-5.30815 10.65006,-10.66846 15.88499,-15.90454l30.54219,-30.54346l35.44746,-35.44761c6.37773,-6.37617 12.79502,-12.91128 19.24454,-19.20322z",
    "M33.82688,47.38228c0.66107,0.31392 5.76736,5.6064 6.75237,6.59224l16.93945,16.95249l85.79959,85.79224c-7.30545,7.64795 -15.59592,15.62842 -23.11645,23.14893l-44.9367,44.93408l-33.14852,33.13037c-4.98204,-5.26758 -9.4258,-11.44482 -11.04228,-18.65771c17.3154,-20.64404 28.43518,-47.94873 31.67401,-74.58398c3.74269,-30.81299 -2.38539,-62.01914 -17.50294,-89.13018c-4.425,-7.88994 -8.65675,-13.89478 -14.18397,-20.94316c0.55294,-2.2686 1.76402,-5.1624 2.76544,-7.2353z",
    "M244.04305,26.28926c2.37498,0.69565 3.99835,1.27617 6.25905,2.30728c-5.31844,5.43208 -10.85225,10.85581 -16.23516,16.23779l-31.92821,31.92334l-61.8278,61.84307c-2.89437,-3.08921 -6.52322,-6.53745 -9.5477,-9.56162l-18.90243,-18.90132l-46.6994,-46.69731c-8.34438,-8.34434 -16.87381,-16.73027 -25.11973,-25.15928c5.43829,-5.93921 11.39904,-9.58579 19.09041,-11.91226c0.46621,-0.01787 4.90791,3.56147 5.59843,4.07622c7.2319,5.35591 14.94628,10.02803 23.0432,13.95615c16.55118,8.04507 34.4793,12.87642 52.83246,14.23755c30.62849,2.36338 61.22489,-4.98193 87.44054,-20.99297c5.24518,-3.20317 11.31084,-7.36904 15.99634,-11.35664z"
  ],

  // viewBox of the original file
  _vb: "0 0 296.98 300",

  /**
   * Bare SVG paths only — color = CSS `color` on parent (currentColor).
   */
  svg(size) {
    size = size || 32;
    const paths = this._d.map(d => `<path d="${d}"/>`).join('');
    return `<svg width="${size}" height="${size}" viewBox="${this._vb}"
      xmlns="http://www.w3.org/2000/svg" fill="currentColor"
      aria-label="PyLaunch" role="img">${paths}</svg>`;
  },

  /**
   * Logo in a rounded square.
   * bg        — background fill  (default: var(--accent))
   * iconColor — path fill        (default: var(--bg-base)  → contrasts on accent)
   */
  icon(size, bg, iconColor) {
    size      = size      || 36;
    bg        = bg        || 'var(--accent)';
    iconColor = iconColor || 'var(--bg-base)';
    const r   = Math.round(size * 0.26);
    const pad = Math.round(size * 0.10);
    const inner = size - pad * 2;
    // scale factor from original viewBox width (296.98) to inner size
    const scale = inner / 296.98;
    const paths = this._d.map(d => `<path d="${d}"/>`).join('');
    return (
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"` +
      ` xmlns="http://www.w3.org/2000/svg" aria-label="PyLaunch" role="img">` +
      `<rect width="${size}" height="${size}" rx="${r}" fill="${bg}"/>` +
      `<g transform="translate(${pad},${pad}) scale(${scale.toFixed(6)})" fill="${iconColor}">` +
      paths +
      `</g></svg>`
    );
  },

  /** Inject icon into a DOM element. */
  render(el, size, bg, iconColor) {
    if (el) el.innerHTML = this.icon(size, bg, iconColor);
  },

  /** Render all [data-logo] placeholders in the document. */
  mountAll() {
    document.querySelectorAll('[data-logo]').forEach(el => {
      const size = parseInt(el.dataset.logoSize || '36');
      el.innerHTML = el.dataset.logo === 'raw'
        ? this.svg(size)
        : this.icon(size);
    });
  },
};

// Re-mount when theme attribute changes on <body>
const _logoObserver = new MutationObserver(() => Logo.mountAll());
document.addEventListener('DOMContentLoaded', () => {
  _logoObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  Logo.mountAll();
});

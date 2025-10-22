/*
  Scroll to Breathe

  This script attaches scroll and click handlers to transform scrolling
  into a meditative breathing animation.  It calculates the user's
  progress through the page and uses that value to drive the colours,
  sizes of shapes and opacity of messages.  A final overlay appears at
  the end, and optional audio can be toggled.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Grab references to elements we'll update.
  const shapes = document.querySelectorAll('.shape');
  const messages = document.querySelectorAll('.affirmation');
  // The final overlay and restart button have been removed for
  // infinite scrolling.  No references are retrieved here.
  // const finalOverlay = document.getElementById('final-overlay');
  // const restartBtn = document.getElementById('restart-btn');
  const audioToggle = document.getElementById('audio-toggle');
  const ambientAudio = document.getElementById('ambient-audio');

  // Reference to the scroll container.  We use its height to
  // calculate scroll progress instead of the entire document.  Setting
  // html/body to height:100% can cause document.scrollHeight to equal
  // the viewport height, so measuring against our own element makes
  // the progress calculation reliable.
  const scrollContainer = document.getElementById('scroll-container');

  // Define where each message should appear along the scroll.  Values
  // represent percentages of total scroll (0–1).  Feel free to tweak
  // these numbers to space the affirmations differently.
  // Five messages are spaced evenly across the scroll.  Adjust these
  // values to modify when each affirmation fades in.  They should be
  // strictly increasing numbers between 0 and 1.
  const messagePositions = [0.10, 0.30, 0.50, 0.70, 0.90];

  /**
   * Interpolate values based on scroll progress.  The scroll event
   * computes a ratio between 0 and 1, which we use to update
   * everything else.
   */
  function handleScroll() {
    // Measure how far the page has been scrolled.  Because
    // html/body no longer have a fixed height, window.pageYOffset
    // properly reflects the scroll distance.  We divide by the
    // scrollable height of the container (its scrollHeight minus the
    // viewport height) to get a progress ratio between 0 and 1.
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const totalScroll = scrollContainer.scrollHeight - window.innerHeight;
    const progress = totalScroll > 0 ? Math.min(1, Math.max(0, scrollTop / totalScroll)) : 0;

    // Background colour: map progress to hue and lightness to create
    // a smooth gradient.  HSL is convenient because you can tweak
    // hue, saturation and lightness separately.  Here we shift the
    // hue across a 100 degree range and gently oscillate the lightness.
    const hue = 200 + progress * 100; // from blue to green
    const lightness = 60 + Math.sin(progress * Math.PI) * 10; // 60–70%
    document.body.style.backgroundColor = `hsl(${hue}, 60%, ${lightness}%)`;

    // The page title remains constant throughout the experience.  You
    // could uncomment the next line during development to display the
    // progress value for debugging purposes.
    // document.title = `Scroll to Breathe – ${progress.toFixed(2)}`;

    // Scale each shape using a sine wave with phase offsets.  The
    // sine function creates smooth expansion and contraction.  Adding a
    // phase offset (index * π / numberOfShapes) staggers the motion so
    // circles breathe alternately rather than synchronously.
    shapes.forEach((shape, index) => {
      const phaseOffset = (index * Math.PI) / shapes.length;
      const phase = progress * 8 * Math.PI + phaseOffset;
      const scale = 0.8 + Math.sin(phase) * 0.2;
      shape.style.transform = `scale(${scale})`;
    });

    // Fade messages in and out around their assigned positions.
    messages.forEach((msg, i) => {
      const target = messagePositions[i];
      const diff = Math.abs(progress - target);
      const fadeRange = 0.12; // how wide the fade in/out region is
      let opacity = 0;
      if (diff < fadeRange) {
        // At the centre of the region the message is fully opaque;
        // outside it gradually fades to 0.
        opacity = 1 - diff / fadeRange;
      }
      msg.style.opacity = opacity;
    });

    // When reaching the end of the scroll, loop back to the top to
    // create an infinite scrolling experience.  A small threshold
    // prevents immediate resetting while still near the end.
    if (progress >= 0.99) {
      // Jump back to the top without animation.  Without {behavior:'smooth'}
      // the browser scrolls instantly, making the loop seamless.
      window.scrollTo(0, 1);
      return;
    }
  }

  // Attach the scroll handler.  Different browsers fire scroll events
  // on either the window or the document element.  We attach to
  // both to ensure the handler runs consistently.  Using
  // { passive: true } improves performance because we never call
  // preventDefault() inside the handler.
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });

  // Initialise on load in case the page opens mid-scroll.
  handleScroll();

  // The restart button no longer exists.  Infinite scroll will loop
  // automatically when the user reaches the end.

  // Toggle audio playback.  This button plays or pauses the
  // ambient sound and updates its own label.  If no source is
  // provided inside the <audio> element, nothing will play.
  audioToggle.addEventListener('click', () => {
    if (ambientAudio.src === '') {
      // If no source file is set, do nothing.  You can add a
      // <source> element in index.html pointing to an audio file.
      alert('Please add an audio source in the HTML to enable sound.');
      return;
    }
    if (ambientAudio.paused) {
      ambientAudio.play().catch(() => {
        /* playback may be blocked until user interacts; ignore errors */
      });
      audioToggle.textContent = 'Pause Sound';
    } else {
      ambientAudio.pause();
      audioToggle.textContent = 'Play Sound';
    }
  });
});
// Interactive demos: a Unity WebGL build that is downloaded only after the visitor picks a
// scene, then told which scene to build through SendMessage (see WebDemoController.cs).
//
// BUILD names the files Unity wrote into demo/Build/. They start with the output folder name
// ("WebDemo"). `ext` is the compression suffix on the data/framework/wasm files: ".gz" for Gzip,
// ".unityweb" if the build names them that way (Decompression Fallback), "" if uncompressed.
document.addEventListener('DOMContentLoaded', function () {
  var BUILD = { dir: 'demo/Build/', name: 'WebDemo', ext: '.unityweb' };
  var OBJECT = 'WebDemoController';

  var player = document.getElementById('demo-player');
  if (!player) return;

  var canvas = document.getElementById('unity-canvas');
  var overlay = document.getElementById('demo-overlay');
  var overlayText = document.getElementById('demo-overlay-text');
  var progress = document.getElementById('demo-progress');
  var progressBar = document.getElementById('demo-progress-bar');
  var controls = document.getElementById('demo-controls');
  var help = document.getElementById('demo-help');
  var toggleGraph = document.getElementById('demo-toggle-graph');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.demo-thumb'));

  var instancePromise = null;
  var graphVisible = true;

  // Middle-mouse drag pans the graph. Without this the browser starts its own autoscroll and the
  // page scrolls along. preventDefault on the mousedown (not the pointer event) cancels it, and
  // does not stop Unity from receiving the same event.
  canvas.addEventListener('mousedown', function (e) { if (e.button === 1) e.preventDefault(); });
  canvas.addEventListener('auxclick', function (e) { if (e.button === 1) e.preventDefault(); });

  function showOverlay(text, withProgress) {
    overlay.hidden = false;
    overlayText.textContent = text;
    progress.hidden = !withProgress;
    if (!withProgress) progressBar.style.width = '0';
  }

  function supportsWebGL2() {
    try {
      return !!document.createElement('canvas').getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.body.appendChild(s);
    });
  }

  function startUnity() {
    if (instancePromise) return instancePromise;

    if (!supportsWebGL2()) {
      showOverlay('This demo needs a browser with WebGL 2.', false);
      return Promise.reject(new Error('WebGL 2 not available'));
    }

    showOverlay('Loading the demo… (a one-time download)', true);
    var prefix = BUILD.dir + BUILD.name;
    var config = {
      dataUrl: prefix + '.data' + BUILD.ext,
      frameworkUrl: prefix + '.framework.js' + BUILD.ext,
      codeUrl: prefix + '.wasm' + BUILD.ext,
      streamingAssetsUrl: 'StreamingAssets',
      companyName: 'SetPiece',
      productName: 'SetPiece Demo',
      productVersion: '1.0',
      devicePixelRatio: 1
    };

    instancePromise = loadScript(prefix + '.loader.js')
      .then(function () {
        return createUnityInstance(canvas, config, function (fraction) {
          progressBar.style.width = Math.round(fraction * 100) + '%';
        });
      })
      .then(function (instance) {
        overlay.hidden = true;
        controls.hidden = false;
        help.hidden = false;
        return instance;
      })
      .catch(function (err) {
        console.error(err);
        instancePromise = null;
        showOverlay('The demo could not be loaded. Please try again later.', false);
        throw err;
      });

    return instancePromise;
  }

  function send(method, value) {
    return startUnity().then(function (instance) {
      if (value === undefined) instance.SendMessage(OBJECT, method);
      else instance.SendMessage(OBJECT, method, value);
    });
  }

  // Debugging aid: with ?debug in the address, window.__demoSend('DumpLayout') etc. is available.
  if (/[?&]debug\b/.test(window.location.search)) window.__demoSend = send;

  // The scene camera and the graph view were framed for the old window size, so re-frame both
  // once the resizing stops. (Under 769px wide the demo is hidden by the stylesheet.)
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!instancePromise) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      instancePromise.then(function (instance) {
        instance.SendMessage(OBJECT, 'Reframe');
      }).catch(function () {});
    }, 400);
  });

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      thumbs.forEach(function (t) { t.setAttribute('aria-selected', t === thumb ? 'true' : 'false'); });
      graphVisible = true;
      if (toggleGraph) toggleGraph.textContent = 'Hide graph';
      send('LoadScenario', thumb.getAttribute('data-scene')).then(function () {
        canvas.focus({ preventScroll: true });
      }).catch(function () { /* already reported in the overlay */ });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo-action]'), function (button) {
    button.addEventListener('click', function () {
      var action = button.getAttribute('data-demo-action');
      if (action === 'ToggleGraph') {
        graphVisible = !graphVisible;
        button.textContent = graphVisible ? 'Hide graph' : 'Show graph';
      }
      send(action).then(function () { canvas.focus({ preventScroll: true }); }).catch(function () {});
    });
  });
});

// Teaser: play with sound. Browsers block unmuted autoplay until the visitor
// interacts with the page, so fall back to muted playback and unmute on the
// first click, tap, or key press. Interactions on the video itself are left
// to its own controls, so its mute button still works as expected.
document.addEventListener('DOMContentLoaded', function () {
  var video = document.getElementById('teaser');
  if (!video) return;

  var events = ['pointerdown', 'keydown', 'touchstart'];
  var unmute = function (e) {
    // A click on the video itself is left to its own controls.
    if (e && e.target === video) {
      events.forEach(function (name) { document.removeEventListener(name, unmute, true); });
      return;
    }
    // Only unmute while the teaser is on screen. Otherwise a first click far down the page
    // (the interactive demo, say) would start sound from a video the visitor cannot see.
    var box = video.getBoundingClientRect();
    var viewHeight = window.innerHeight || document.documentElement.clientHeight;
    if (box.bottom <= 0 || box.top >= viewHeight) return;

    events.forEach(function (name) { document.removeEventListener(name, unmute, true); });
    video.muted = false;
    video.play().catch(function () {});
  };

  video.muted = false;
  var attempt = video.play();
  if (attempt && attempt.catch) {
    attempt.catch(function () {
      video.muted = true;
      video.play().catch(function () {});
      events.forEach(function (e) { document.addEventListener(e, unmute, true); });
    });
  }
});

// Copy the BibTeX block to the clipboard.
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('copy-bibtex');
  var code = document.getElementById('bibtex-code');
  if (!btn || !code) return;

  btn.addEventListener('click', function () {
    var label = btn.querySelector('.copy-label');
    var done = function (text) {
      label.textContent = text;
      setTimeout(function () { label.textContent = 'Copy'; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code.textContent).then(
        function () { done('Copied'); },
        function () { done('Press Ctrl+C'); }
      );
    } else {
      done('Press Ctrl+C');
    }
  });
});

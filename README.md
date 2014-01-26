SpriteEngine
============

A simple retained mode API for HTML5 Canvas.

SpriteEngine is a fairly simple system for using HTML5 Canvas in retained mode.

SpriteEngine.js was originally developed for educational purposes only; it was developed
as a teaching aid on City University's (London, UK) Multimedia course. It is probably not
robust enough to underpin a commercial application. In particular SpriteEngine.js is not
error tolerant; if it is not used in the ways described in the API it is unlikely to fail
gracefully.

SpriteEngine.js is specifically targeted at Firefox v10.

It is probably best, as far as possible, not to mix SpriteEngine with raw canvas code,
as this might cause problems. In particular SpriteEngine assumes that the canvas has no
transformations, clipping or compositing applied to it.
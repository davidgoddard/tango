(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // dist/lib/howler.min.js
  var require_howler_min = __commonJS({
    "dist/lib/howler.min.js"(exports) {
      !function() {
        "use strict";
        var e = function() {
          this.init();
        };
        e.prototype = { init: function() {
          var e2 = this || n;
          return e2._counter = 1e3, e2._html5AudioPool = [], e2.html5PoolSize = 10, e2._codecs = {}, e2._howls = [], e2._muted = false, e2._volume = 1, e2._canPlayEvent = "canplaythrough", e2._navigator = "undefined" != typeof window && window.navigator ? window.navigator : null, e2.masterGain = null, e2.noAudio = false, e2.usingWebAudio = true, e2.autoSuspend = true, e2.ctx = null, e2.autoUnlock = true, e2._setup(), e2;
        }, volume: function(e2) {
          var o2 = this || n;
          if (e2 = parseFloat(e2), o2.ctx || _(), void 0 !== e2 && e2 >= 0 && e2 <= 1) {
            if (o2._volume = e2, o2._muted) return o2;
            o2.usingWebAudio && o2.masterGain.gain.setValueAtTime(e2, n.ctx.currentTime);
            for (var t2 = 0; t2 < o2._howls.length; t2++) if (!o2._howls[t2]._webAudio) for (var r2 = o2._howls[t2]._getSoundIds(), a2 = 0; a2 < r2.length; a2++) {
              var u2 = o2._howls[t2]._soundById(r2[a2]);
              u2 && u2._node && (u2._node.volume = u2._volume * e2);
            }
            return o2;
          }
          return o2._volume;
        }, mute: function(e2) {
          var o2 = this || n;
          o2.ctx || _(), o2._muted = e2, o2.usingWebAudio && o2.masterGain.gain.setValueAtTime(e2 ? 0 : o2._volume, n.ctx.currentTime);
          for (var t2 = 0; t2 < o2._howls.length; t2++) if (!o2._howls[t2]._webAudio) for (var r2 = o2._howls[t2]._getSoundIds(), a2 = 0; a2 < r2.length; a2++) {
            var u2 = o2._howls[t2]._soundById(r2[a2]);
            u2 && u2._node && (u2._node.muted = !!e2 || u2._muted);
          }
          return o2;
        }, stop: function() {
          for (var e2 = this || n, o2 = 0; o2 < e2._howls.length; o2++) e2._howls[o2].stop();
          return e2;
        }, unload: function() {
          for (var e2 = this || n, o2 = e2._howls.length - 1; o2 >= 0; o2--) e2._howls[o2].unload();
          return e2.usingWebAudio && e2.ctx && void 0 !== e2.ctx.close && (e2.ctx.close(), e2.ctx = null, _()), e2;
        }, codecs: function(e2) {
          return (this || n)._codecs[e2.replace(/^x-/, "")];
        }, _setup: function() {
          var e2 = this || n;
          if (e2.state = e2.ctx ? e2.ctx.state || "suspended" : "suspended", e2._autoSuspend(), !e2.usingWebAudio) if ("undefined" != typeof Audio) try {
            var o2 = new Audio();
            void 0 === o2.oncanplaythrough && (e2._canPlayEvent = "canplay");
          } catch (n2) {
            e2.noAudio = true;
          }
          else e2.noAudio = true;
          try {
            var o2 = new Audio();
            o2.muted && (e2.noAudio = true);
          } catch (e3) {
          }
          return e2.noAudio || e2._setupCodecs(), e2;
        }, _setupCodecs: function() {
          var e2 = this || n, o2 = null;
          try {
            o2 = "undefined" != typeof Audio ? new Audio() : null;
          } catch (n2) {
            return e2;
          }
          if (!o2 || "function" != typeof o2.canPlayType) return e2;
          var t2 = o2.canPlayType("audio/mpeg;").replace(/^no$/, ""), r2 = e2._navigator ? e2._navigator.userAgent : "", a2 = r2.match(/OPR\/(\d+)/g), u2 = a2 && parseInt(a2[0].split("/")[1], 10) < 33, d2 = -1 !== r2.indexOf("Safari") && -1 === r2.indexOf("Chrome"), i2 = r2.match(/Version\/(.*?) /), _2 = d2 && i2 && parseInt(i2[1], 10) < 15;
          return e2._codecs = { mp3: !(u2 || !t2 && !o2.canPlayType("audio/mp3;").replace(/^no$/, "")), mpeg: !!t2, opus: !!o2.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""), ogg: !!o2.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), oga: !!o2.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), wav: !!(o2.canPlayType('audio/wav; codecs="1"') || o2.canPlayType("audio/wav")).replace(/^no$/, ""), aac: !!o2.canPlayType("audio/aac;").replace(/^no$/, ""), caf: !!o2.canPlayType("audio/x-caf;").replace(/^no$/, ""), m4a: !!(o2.canPlayType("audio/x-m4a;") || o2.canPlayType("audio/m4a;") || o2.canPlayType("audio/aac;")).replace(/^no$/, ""), m4b: !!(o2.canPlayType("audio/x-m4b;") || o2.canPlayType("audio/m4b;") || o2.canPlayType("audio/aac;")).replace(/^no$/, ""), mp4: !!(o2.canPlayType("audio/x-mp4;") || o2.canPlayType("audio/mp4;") || o2.canPlayType("audio/aac;")).replace(/^no$/, ""), weba: !(_2 || !o2.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")), webm: !(_2 || !o2.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")), dolby: !!o2.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""), flac: !!(o2.canPlayType("audio/x-flac;") || o2.canPlayType("audio/flac;")).replace(/^no$/, "") }, e2;
        }, _unlockAudio: function() {
          var e2 = this || n;
          if (!e2._audioUnlocked && e2.ctx) {
            e2._audioUnlocked = false, e2.autoUnlock = false, e2._mobileUnloaded || 44100 === e2.ctx.sampleRate || (e2._mobileUnloaded = true, e2.unload()), e2._scratchBuffer = e2.ctx.createBuffer(1, 1, 22050);
            var o2 = function(n2) {
              for (; e2._html5AudioPool.length < e2.html5PoolSize; ) try {
                var t2 = new Audio();
                t2._unlocked = true, e2._releaseHtml5Audio(t2);
              } catch (n3) {
                e2.noAudio = true;
                break;
              }
              for (var r2 = 0; r2 < e2._howls.length; r2++) if (!e2._howls[r2]._webAudio) for (var a2 = e2._howls[r2]._getSoundIds(), u2 = 0; u2 < a2.length; u2++) {
                var d2 = e2._howls[r2]._soundById(a2[u2]);
                d2 && d2._node && !d2._node._unlocked && (d2._node._unlocked = true, d2._node.load());
              }
              e2._autoResume();
              var i2 = e2.ctx.createBufferSource();
              i2.buffer = e2._scratchBuffer, i2.connect(e2.ctx.destination), void 0 === i2.start ? i2.noteOn(0) : i2.start(0), "function" == typeof e2.ctx.resume && e2.ctx.resume(), i2.onended = function() {
                i2.disconnect(0), e2._audioUnlocked = true, document.removeEventListener("touchstart", o2, true), document.removeEventListener("touchend", o2, true), document.removeEventListener("click", o2, true), document.removeEventListener("keydown", o2, true);
                for (var n3 = 0; n3 < e2._howls.length; n3++) e2._howls[n3]._emit("unlock");
              };
            };
            return document.addEventListener("touchstart", o2, true), document.addEventListener("touchend", o2, true), document.addEventListener("click", o2, true), document.addEventListener("keydown", o2, true), e2;
          }
        }, _obtainHtml5Audio: function() {
          var e2 = this || n;
          if (e2._html5AudioPool.length) return e2._html5AudioPool.pop();
          var o2 = new Audio().play();
          return o2 && "undefined" != typeof Promise && (o2 instanceof Promise || "function" == typeof o2.then) && o2.catch(function() {
            console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
          }), new Audio();
        }, _releaseHtml5Audio: function(e2) {
          var o2 = this || n;
          return e2._unlocked && o2._html5AudioPool.push(e2), o2;
        }, _autoSuspend: function() {
          var e2 = this;
          if (e2.autoSuspend && e2.ctx && void 0 !== e2.ctx.suspend && n.usingWebAudio) {
            for (var o2 = 0; o2 < e2._howls.length; o2++) if (e2._howls[o2]._webAudio) {
              for (var t2 = 0; t2 < e2._howls[o2]._sounds.length; t2++) if (!e2._howls[o2]._sounds[t2]._paused) return e2;
            }
            return e2._suspendTimer && clearTimeout(e2._suspendTimer), e2._suspendTimer = setTimeout(function() {
              if (e2.autoSuspend) {
                e2._suspendTimer = null, e2.state = "suspending";
                var n2 = function() {
                  e2.state = "suspended", e2._resumeAfterSuspend && (delete e2._resumeAfterSuspend, e2._autoResume());
                };
                e2.ctx.suspend().then(n2, n2);
              }
            }, 3e4), e2;
          }
        }, _autoResume: function() {
          var e2 = this;
          if (e2.ctx && void 0 !== e2.ctx.resume && n.usingWebAudio) return "running" === e2.state && "interrupted" !== e2.ctx.state && e2._suspendTimer ? (clearTimeout(e2._suspendTimer), e2._suspendTimer = null) : "suspended" === e2.state || "running" === e2.state && "interrupted" === e2.ctx.state ? (e2.ctx.resume().then(function() {
            e2.state = "running";
            for (var n2 = 0; n2 < e2._howls.length; n2++) e2._howls[n2]._emit("resume");
          }), e2._suspendTimer && (clearTimeout(e2._suspendTimer), e2._suspendTimer = null)) : "suspending" === e2.state && (e2._resumeAfterSuspend = true), e2;
        } };
        var n = new e(), o = function(e2) {
          var n2 = this;
          if (!e2.src || 0 === e2.src.length) return void console.error("An array of source files must be passed with any new Howl.");
          n2.init(e2);
        };
        o.prototype = { init: function(e2) {
          var o2 = this;
          return n.ctx || _(), o2._autoplay = e2.autoplay || false, o2._format = "string" != typeof e2.format ? e2.format : [e2.format], o2._html5 = e2.html5 || false, o2._muted = e2.mute || false, o2._loop = e2.loop || false, o2._pool = e2.pool || 5, o2._preload = "boolean" != typeof e2.preload && "metadata" !== e2.preload || e2.preload, o2._rate = e2.rate || 1, o2._sprite = e2.sprite || {}, o2._src = "string" != typeof e2.src ? e2.src : [e2.src], o2._volume = void 0 !== e2.volume ? e2.volume : 1, o2._xhr = { method: e2.xhr && e2.xhr.method ? e2.xhr.method : "GET", headers: e2.xhr && e2.xhr.headers ? e2.xhr.headers : null, withCredentials: !(!e2.xhr || !e2.xhr.withCredentials) && e2.xhr.withCredentials }, o2._duration = 0, o2._state = "unloaded", o2._sounds = [], o2._endTimers = {}, o2._queue = [], o2._playLock = false, o2._onend = e2.onend ? [{ fn: e2.onend }] : [], o2._onfade = e2.onfade ? [{ fn: e2.onfade }] : [], o2._onload = e2.onload ? [{ fn: e2.onload }] : [], o2._onloaderror = e2.onloaderror ? [{ fn: e2.onloaderror }] : [], o2._onplayerror = e2.onplayerror ? [{ fn: e2.onplayerror }] : [], o2._onpause = e2.onpause ? [{ fn: e2.onpause }] : [], o2._onplay = e2.onplay ? [{ fn: e2.onplay }] : [], o2._onstop = e2.onstop ? [{ fn: e2.onstop }] : [], o2._onmute = e2.onmute ? [{ fn: e2.onmute }] : [], o2._onvolume = e2.onvolume ? [{ fn: e2.onvolume }] : [], o2._onrate = e2.onrate ? [{ fn: e2.onrate }] : [], o2._onseek = e2.onseek ? [{ fn: e2.onseek }] : [], o2._onunlock = e2.onunlock ? [{ fn: e2.onunlock }] : [], o2._onresume = [], o2._webAudio = n.usingWebAudio && !o2._html5, void 0 !== n.ctx && n.ctx && n.autoUnlock && n._unlockAudio(), n._howls.push(o2), o2._autoplay && o2._queue.push({ event: "play", action: function() {
            o2.play();
          } }), o2._preload && "none" !== o2._preload && o2.load(), o2;
        }, load: function() {
          var e2 = this, o2 = null;
          if (n.noAudio) return void e2._emit("loaderror", null, "No audio support.");
          "string" == typeof e2._src && (e2._src = [e2._src]);
          for (var r2 = 0; r2 < e2._src.length; r2++) {
            var u2, d2;
            if (e2._format && e2._format[r2]) u2 = e2._format[r2];
            else {
              if ("string" != typeof (d2 = e2._src[r2])) {
                e2._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                continue;
              }
              u2 = /^data:audio\/([^;,]+);/i.exec(d2), u2 || (u2 = /\.([^.]+)$/.exec(d2.split("?", 1)[0])), u2 && (u2 = u2[1].toLowerCase());
            }
            if (u2 || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), u2 && n.codecs(u2)) {
              o2 = e2._src[r2];
              break;
            }
          }
          return o2 ? (e2._src = o2, e2._state = "loading", "https:" === window.location.protocol && "http:" === o2.slice(0, 5) && (e2._html5 = true, e2._webAudio = false), new t(e2), e2._webAudio && a(e2), e2) : void e2._emit("loaderror", null, "No codec support for selected audio sources.");
        }, play: function(e2, o2) {
          var t2 = this, r2 = null;
          if ("number" == typeof e2) r2 = e2, e2 = null;
          else {
            if ("string" == typeof e2 && "loaded" === t2._state && !t2._sprite[e2]) return null;
            if (void 0 === e2 && (e2 = "__default", !t2._playLock)) {
              for (var a2 = 0, u2 = 0; u2 < t2._sounds.length; u2++) t2._sounds[u2]._paused && !t2._sounds[u2]._ended && (a2++, r2 = t2._sounds[u2]._id);
              1 === a2 ? e2 = null : r2 = null;
            }
          }
          var d2 = r2 ? t2._soundById(r2) : t2._inactiveSound();
          if (!d2) return null;
          if (r2 && !e2 && (e2 = d2._sprite || "__default"), "loaded" !== t2._state) {
            d2._sprite = e2, d2._ended = false;
            var i2 = d2._id;
            return t2._queue.push({ event: "play", action: function() {
              t2.play(i2);
            } }), i2;
          }
          if (r2 && !d2._paused) return o2 || t2._loadQueue("play"), d2._id;
          t2._webAudio && n._autoResume();
          var _2 = Math.max(0, d2._seek > 0 ? d2._seek : t2._sprite[e2][0] / 1e3), s = Math.max(0, (t2._sprite[e2][0] + t2._sprite[e2][1]) / 1e3 - _2), l = 1e3 * s / Math.abs(d2._rate), c = t2._sprite[e2][0] / 1e3, f = (t2._sprite[e2][0] + t2._sprite[e2][1]) / 1e3;
          d2._sprite = e2, d2._ended = false;
          var p = function() {
            d2._paused = false, d2._seek = _2, d2._start = c, d2._stop = f, d2._loop = !(!d2._loop && !t2._sprite[e2][2]);
          };
          if (_2 >= f) return void t2._ended(d2);
          var m = d2._node;
          if (t2._webAudio) {
            var v = function() {
              t2._playLock = false, p(), t2._refreshBuffer(d2);
              var e3 = d2._muted || t2._muted ? 0 : d2._volume;
              m.gain.setValueAtTime(e3, n.ctx.currentTime), d2._playStart = n.ctx.currentTime, void 0 === m.bufferSource.start ? d2._loop ? m.bufferSource.noteGrainOn(0, _2, 86400) : m.bufferSource.noteGrainOn(0, _2, s) : d2._loop ? m.bufferSource.start(0, _2, 86400) : m.bufferSource.start(0, _2, s), l !== 1 / 0 && (t2._endTimers[d2._id] = setTimeout(t2._ended.bind(t2, d2), l)), o2 || setTimeout(function() {
                t2._emit("play", d2._id), t2._loadQueue();
              }, 0);
            };
            "running" === n.state && "interrupted" !== n.ctx.state ? v() : (t2._playLock = true, t2.once("resume", v), t2._clearTimer(d2._id));
          } else {
            var h = function() {
              m.currentTime = _2, m.muted = d2._muted || t2._muted || n._muted || m.muted, m.volume = d2._volume * n.volume(), m.playbackRate = d2._rate;
              try {
                var r3 = m.play();
                if (r3 && "undefined" != typeof Promise && (r3 instanceof Promise || "function" == typeof r3.then) ? (t2._playLock = true, p(), r3.then(function() {
                  t2._playLock = false, m._unlocked = true, o2 ? t2._loadQueue() : t2._emit("play", d2._id);
                }).catch(function() {
                  t2._playLock = false, t2._emit("playerror", d2._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), d2._ended = true, d2._paused = true;
                })) : o2 || (t2._playLock = false, p(), t2._emit("play", d2._id)), m.playbackRate = d2._rate, m.paused) return void t2._emit("playerror", d2._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                "__default" !== e2 || d2._loop ? t2._endTimers[d2._id] = setTimeout(t2._ended.bind(t2, d2), l) : (t2._endTimers[d2._id] = function() {
                  t2._ended(d2), m.removeEventListener("ended", t2._endTimers[d2._id], false);
                }, m.addEventListener("ended", t2._endTimers[d2._id], false));
              } catch (e3) {
                t2._emit("playerror", d2._id, e3);
              }
            };
            "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" === m.src && (m.src = t2._src, m.load());
            var y = window && window.ejecta || !m.readyState && n._navigator.isCocoonJS;
            if (m.readyState >= 3 || y) h();
            else {
              t2._playLock = true, t2._state = "loading";
              var g = function() {
                t2._state = "loaded", h(), m.removeEventListener(n._canPlayEvent, g, false);
              };
              m.addEventListener(n._canPlayEvent, g, false), t2._clearTimer(d2._id);
            }
          }
          return d2._id;
        }, pause: function(e2) {
          var n2 = this;
          if ("loaded" !== n2._state || n2._playLock) return n2._queue.push({ event: "pause", action: function() {
            n2.pause(e2);
          } }), n2;
          for (var o2 = n2._getSoundIds(e2), t2 = 0; t2 < o2.length; t2++) {
            n2._clearTimer(o2[t2]);
            var r2 = n2._soundById(o2[t2]);
            if (r2 && !r2._paused && (r2._seek = n2.seek(o2[t2]), r2._rateSeek = 0, r2._paused = true, n2._stopFade(o2[t2]), r2._node)) if (n2._webAudio) {
              if (!r2._node.bufferSource) continue;
              void 0 === r2._node.bufferSource.stop ? r2._node.bufferSource.noteOff(0) : r2._node.bufferSource.stop(0), n2._cleanBuffer(r2._node);
            } else isNaN(r2._node.duration) && r2._node.duration !== 1 / 0 || r2._node.pause();
            arguments[1] || n2._emit("pause", r2 ? r2._id : null);
          }
          return n2;
        }, stop: function(e2, n2) {
          var o2 = this;
          if ("loaded" !== o2._state || o2._playLock) return o2._queue.push({ event: "stop", action: function() {
            o2.stop(e2);
          } }), o2;
          for (var t2 = o2._getSoundIds(e2), r2 = 0; r2 < t2.length; r2++) {
            o2._clearTimer(t2[r2]);
            var a2 = o2._soundById(t2[r2]);
            a2 && (a2._seek = a2._start || 0, a2._rateSeek = 0, a2._paused = true, a2._ended = true, o2._stopFade(t2[r2]), a2._node && (o2._webAudio ? a2._node.bufferSource && (void 0 === a2._node.bufferSource.stop ? a2._node.bufferSource.noteOff(0) : a2._node.bufferSource.stop(0), o2._cleanBuffer(a2._node)) : isNaN(a2._node.duration) && a2._node.duration !== 1 / 0 || (a2._node.currentTime = a2._start || 0, a2._node.pause(), a2._node.duration === 1 / 0 && o2._clearSound(a2._node))), n2 || o2._emit("stop", a2._id));
          }
          return o2;
        }, mute: function(e2, o2) {
          var t2 = this;
          if ("loaded" !== t2._state || t2._playLock) return t2._queue.push({ event: "mute", action: function() {
            t2.mute(e2, o2);
          } }), t2;
          if (void 0 === o2) {
            if ("boolean" != typeof e2) return t2._muted;
            t2._muted = e2;
          }
          for (var r2 = t2._getSoundIds(o2), a2 = 0; a2 < r2.length; a2++) {
            var u2 = t2._soundById(r2[a2]);
            u2 && (u2._muted = e2, u2._interval && t2._stopFade(u2._id), t2._webAudio && u2._node ? u2._node.gain.setValueAtTime(e2 ? 0 : u2._volume, n.ctx.currentTime) : u2._node && (u2._node.muted = !!n._muted || e2), t2._emit("mute", u2._id));
          }
          return t2;
        }, volume: function() {
          var e2, o2, t2 = this, r2 = arguments;
          if (0 === r2.length) return t2._volume;
          if (1 === r2.length || 2 === r2.length && void 0 === r2[1]) {
            t2._getSoundIds().indexOf(r2[0]) >= 0 ? o2 = parseInt(r2[0], 10) : e2 = parseFloat(r2[0]);
          } else r2.length >= 2 && (e2 = parseFloat(r2[0]), o2 = parseInt(r2[1], 10));
          var a2;
          if (!(void 0 !== e2 && e2 >= 0 && e2 <= 1)) return a2 = o2 ? t2._soundById(o2) : t2._sounds[0], a2 ? a2._volume : 0;
          if ("loaded" !== t2._state || t2._playLock) return t2._queue.push({ event: "volume", action: function() {
            t2.volume.apply(t2, r2);
          } }), t2;
          void 0 === o2 && (t2._volume = e2), o2 = t2._getSoundIds(o2);
          for (var u2 = 0; u2 < o2.length; u2++) (a2 = t2._soundById(o2[u2])) && (a2._volume = e2, r2[2] || t2._stopFade(o2[u2]), t2._webAudio && a2._node && !a2._muted ? a2._node.gain.setValueAtTime(e2, n.ctx.currentTime) : a2._node && !a2._muted && (a2._node.volume = e2 * n.volume()), t2._emit("volume", a2._id));
          return t2;
        }, fade: function(e2, o2, t2, r2) {
          var a2 = this;
          if ("loaded" !== a2._state || a2._playLock) return a2._queue.push({ event: "fade", action: function() {
            a2.fade(e2, o2, t2, r2);
          } }), a2;
          e2 = Math.min(Math.max(0, parseFloat(e2)), 1), o2 = Math.min(Math.max(0, parseFloat(o2)), 1), t2 = parseFloat(t2), a2.volume(e2, r2);
          for (var u2 = a2._getSoundIds(r2), d2 = 0; d2 < u2.length; d2++) {
            var i2 = a2._soundById(u2[d2]);
            if (i2) {
              if (r2 || a2._stopFade(u2[d2]), a2._webAudio && !i2._muted) {
                var _2 = n.ctx.currentTime, s = _2 + t2 / 1e3;
                i2._volume = e2, i2._node.gain.setValueAtTime(e2, _2), i2._node.gain.linearRampToValueAtTime(o2, s);
              }
              a2._startFadeInterval(i2, e2, o2, t2, u2[d2], void 0 === r2);
            }
          }
          return a2;
        }, _startFadeInterval: function(e2, n2, o2, t2, r2, a2) {
          var u2 = this, d2 = n2, i2 = o2 - n2, _2 = Math.abs(i2 / 0.01), s = Math.max(4, _2 > 0 ? t2 / _2 : t2), l = Date.now();
          e2._fadeTo = o2, e2._interval = setInterval(function() {
            var r3 = (Date.now() - l) / t2;
            l = Date.now(), d2 += i2 * r3, d2 = Math.round(100 * d2) / 100, d2 = i2 < 0 ? Math.max(o2, d2) : Math.min(o2, d2), u2._webAudio ? e2._volume = d2 : u2.volume(d2, e2._id, true), a2 && (u2._volume = d2), (o2 < n2 && d2 <= o2 || o2 > n2 && d2 >= o2) && (clearInterval(e2._interval), e2._interval = null, e2._fadeTo = null, u2.volume(o2, e2._id), u2._emit("fade", e2._id));
          }, s);
        }, _stopFade: function(e2) {
          var o2 = this, t2 = o2._soundById(e2);
          return t2 && t2._interval && (o2._webAudio && t2._node.gain.cancelScheduledValues(n.ctx.currentTime), clearInterval(t2._interval), t2._interval = null, o2.volume(t2._fadeTo, e2), t2._fadeTo = null, o2._emit("fade", e2)), o2;
        }, loop: function() {
          var e2, n2, o2, t2 = this, r2 = arguments;
          if (0 === r2.length) return t2._loop;
          if (1 === r2.length) {
            if ("boolean" != typeof r2[0]) return !!(o2 = t2._soundById(parseInt(r2[0], 10))) && o2._loop;
            e2 = r2[0], t2._loop = e2;
          } else 2 === r2.length && (e2 = r2[0], n2 = parseInt(r2[1], 10));
          for (var a2 = t2._getSoundIds(n2), u2 = 0; u2 < a2.length; u2++) (o2 = t2._soundById(a2[u2])) && (o2._loop = e2, t2._webAudio && o2._node && o2._node.bufferSource && (o2._node.bufferSource.loop = e2, e2 && (o2._node.bufferSource.loopStart = o2._start || 0, o2._node.bufferSource.loopEnd = o2._stop, t2.playing(a2[u2]) && (t2.pause(a2[u2], true), t2.play(a2[u2], true)))));
          return t2;
        }, rate: function() {
          var e2, o2, t2 = this, r2 = arguments;
          if (0 === r2.length) o2 = t2._sounds[0]._id;
          else if (1 === r2.length) {
            var a2 = t2._getSoundIds(), u2 = a2.indexOf(r2[0]);
            u2 >= 0 ? o2 = parseInt(r2[0], 10) : e2 = parseFloat(r2[0]);
          } else 2 === r2.length && (e2 = parseFloat(r2[0]), o2 = parseInt(r2[1], 10));
          var d2;
          if ("number" != typeof e2) return d2 = t2._soundById(o2), d2 ? d2._rate : t2._rate;
          if ("loaded" !== t2._state || t2._playLock) return t2._queue.push({ event: "rate", action: function() {
            t2.rate.apply(t2, r2);
          } }), t2;
          void 0 === o2 && (t2._rate = e2), o2 = t2._getSoundIds(o2);
          for (var i2 = 0; i2 < o2.length; i2++) if (d2 = t2._soundById(o2[i2])) {
            t2.playing(o2[i2]) && (d2._rateSeek = t2.seek(o2[i2]), d2._playStart = t2._webAudio ? n.ctx.currentTime : d2._playStart), d2._rate = e2, t2._webAudio && d2._node && d2._node.bufferSource ? d2._node.bufferSource.playbackRate.setValueAtTime(e2, n.ctx.currentTime) : d2._node && (d2._node.playbackRate = e2);
            var _2 = t2.seek(o2[i2]), s = (t2._sprite[d2._sprite][0] + t2._sprite[d2._sprite][1]) / 1e3 - _2, l = 1e3 * s / Math.abs(d2._rate);
            !t2._endTimers[o2[i2]] && d2._paused || (t2._clearTimer(o2[i2]), t2._endTimers[o2[i2]] = setTimeout(t2._ended.bind(t2, d2), l)), t2._emit("rate", d2._id);
          }
          return t2;
        }, seek: function() {
          var e2, o2, t2 = this, r2 = arguments;
          if (0 === r2.length) t2._sounds.length && (o2 = t2._sounds[0]._id);
          else if (1 === r2.length) {
            var a2 = t2._getSoundIds(), u2 = a2.indexOf(r2[0]);
            u2 >= 0 ? o2 = parseInt(r2[0], 10) : t2._sounds.length && (o2 = t2._sounds[0]._id, e2 = parseFloat(r2[0]));
          } else 2 === r2.length && (e2 = parseFloat(r2[0]), o2 = parseInt(r2[1], 10));
          if (void 0 === o2) return 0;
          if ("number" == typeof e2 && ("loaded" !== t2._state || t2._playLock)) return t2._queue.push({ event: "seek", action: function() {
            t2.seek.apply(t2, r2);
          } }), t2;
          var d2 = t2._soundById(o2);
          if (d2) {
            if (!("number" == typeof e2 && e2 >= 0)) {
              if (t2._webAudio) {
                var i2 = t2.playing(o2) ? n.ctx.currentTime - d2._playStart : 0, _2 = d2._rateSeek ? d2._rateSeek - d2._seek : 0;
                return d2._seek + (_2 + i2 * Math.abs(d2._rate));
              }
              return d2._node.currentTime;
            }
            var s = t2.playing(o2);
            s && t2.pause(o2, true), d2._seek = e2, d2._ended = false, t2._clearTimer(o2), t2._webAudio || !d2._node || isNaN(d2._node.duration) || (d2._node.currentTime = e2);
            var l = function() {
              s && t2.play(o2, true), t2._emit("seek", o2);
            };
            if (s && !t2._webAudio) {
              var c = function() {
                t2._playLock ? setTimeout(c, 0) : l();
              };
              setTimeout(c, 0);
            } else l();
          }
          return t2;
        }, playing: function(e2) {
          var n2 = this;
          if ("number" == typeof e2) {
            var o2 = n2._soundById(e2);
            return !!o2 && !o2._paused;
          }
          for (var t2 = 0; t2 < n2._sounds.length; t2++) if (!n2._sounds[t2]._paused) return true;
          return false;
        }, duration: function(e2) {
          var n2 = this, o2 = n2._duration, t2 = n2._soundById(e2);
          return t2 && (o2 = n2._sprite[t2._sprite][1] / 1e3), o2;
        }, state: function() {
          return this._state;
        }, unload: function() {
          for (var e2 = this, o2 = e2._sounds, t2 = 0; t2 < o2.length; t2++) o2[t2]._paused || e2.stop(o2[t2]._id), e2._webAudio || (e2._clearSound(o2[t2]._node), o2[t2]._node.removeEventListener("error", o2[t2]._errorFn, false), o2[t2]._node.removeEventListener(n._canPlayEvent, o2[t2]._loadFn, false), o2[t2]._node.removeEventListener("ended", o2[t2]._endFn, false), n._releaseHtml5Audio(o2[t2]._node)), delete o2[t2]._node, e2._clearTimer(o2[t2]._id);
          var a2 = n._howls.indexOf(e2);
          a2 >= 0 && n._howls.splice(a2, 1);
          var u2 = true;
          for (t2 = 0; t2 < n._howls.length; t2++) if (n._howls[t2]._src === e2._src || e2._src.indexOf(n._howls[t2]._src) >= 0) {
            u2 = false;
            break;
          }
          return r && u2 && delete r[e2._src], n.noAudio = false, e2._state = "unloaded", e2._sounds = [], e2 = null, null;
        }, on: function(e2, n2, o2, t2) {
          var r2 = this, a2 = r2["_on" + e2];
          return "function" == typeof n2 && a2.push(t2 ? { id: o2, fn: n2, once: t2 } : { id: o2, fn: n2 }), r2;
        }, off: function(e2, n2, o2) {
          var t2 = this, r2 = t2["_on" + e2], a2 = 0;
          if ("number" == typeof n2 && (o2 = n2, n2 = null), n2 || o2) for (a2 = 0; a2 < r2.length; a2++) {
            var u2 = o2 === r2[a2].id;
            if (n2 === r2[a2].fn && u2 || !n2 && u2) {
              r2.splice(a2, 1);
              break;
            }
          }
          else if (e2) t2["_on" + e2] = [];
          else {
            var d2 = Object.keys(t2);
            for (a2 = 0; a2 < d2.length; a2++) 0 === d2[a2].indexOf("_on") && Array.isArray(t2[d2[a2]]) && (t2[d2[a2]] = []);
          }
          return t2;
        }, once: function(e2, n2, o2) {
          var t2 = this;
          return t2.on(e2, n2, o2, 1), t2;
        }, _emit: function(e2, n2, o2) {
          for (var t2 = this, r2 = t2["_on" + e2], a2 = r2.length - 1; a2 >= 0; a2--) r2[a2].id && r2[a2].id !== n2 && "load" !== e2 || (setTimeout(function(e3) {
            e3.call(this, n2, o2);
          }.bind(t2, r2[a2].fn), 0), r2[a2].once && t2.off(e2, r2[a2].fn, r2[a2].id));
          return t2._loadQueue(e2), t2;
        }, _loadQueue: function(e2) {
          var n2 = this;
          if (n2._queue.length > 0) {
            var o2 = n2._queue[0];
            o2.event === e2 && (n2._queue.shift(), n2._loadQueue()), e2 || o2.action();
          }
          return n2;
        }, _ended: function(e2) {
          var o2 = this, t2 = e2._sprite;
          if (!o2._webAudio && e2._node && !e2._node.paused && !e2._node.ended && e2._node.currentTime < e2._stop) return setTimeout(o2._ended.bind(o2, e2), 100), o2;
          var r2 = !(!e2._loop && !o2._sprite[t2][2]);
          if (o2._emit("end", e2._id), !o2._webAudio && r2 && o2.stop(e2._id, true).play(e2._id), o2._webAudio && r2) {
            o2._emit("play", e2._id), e2._seek = e2._start || 0, e2._rateSeek = 0, e2._playStart = n.ctx.currentTime;
            var a2 = 1e3 * (e2._stop - e2._start) / Math.abs(e2._rate);
            o2._endTimers[e2._id] = setTimeout(o2._ended.bind(o2, e2), a2);
          }
          return o2._webAudio && !r2 && (e2._paused = true, e2._ended = true, e2._seek = e2._start || 0, e2._rateSeek = 0, o2._clearTimer(e2._id), o2._cleanBuffer(e2._node), n._autoSuspend()), o2._webAudio || r2 || o2.stop(e2._id, true), o2;
        }, _clearTimer: function(e2) {
          var n2 = this;
          if (n2._endTimers[e2]) {
            if ("function" != typeof n2._endTimers[e2]) clearTimeout(n2._endTimers[e2]);
            else {
              var o2 = n2._soundById(e2);
              o2 && o2._node && o2._node.removeEventListener("ended", n2._endTimers[e2], false);
            }
            delete n2._endTimers[e2];
          }
          return n2;
        }, _soundById: function(e2) {
          for (var n2 = this, o2 = 0; o2 < n2._sounds.length; o2++) if (e2 === n2._sounds[o2]._id) return n2._sounds[o2];
          return null;
        }, _inactiveSound: function() {
          var e2 = this;
          e2._drain();
          for (var n2 = 0; n2 < e2._sounds.length; n2++) if (e2._sounds[n2]._ended) return e2._sounds[n2].reset();
          return new t(e2);
        }, _drain: function() {
          var e2 = this, n2 = e2._pool, o2 = 0, t2 = 0;
          if (!(e2._sounds.length < n2)) {
            for (t2 = 0; t2 < e2._sounds.length; t2++) e2._sounds[t2]._ended && o2++;
            for (t2 = e2._sounds.length - 1; t2 >= 0; t2--) {
              if (o2 <= n2) return;
              e2._sounds[t2]._ended && (e2._webAudio && e2._sounds[t2]._node && e2._sounds[t2]._node.disconnect(0), e2._sounds.splice(t2, 1), o2--);
            }
          }
        }, _getSoundIds: function(e2) {
          var n2 = this;
          if (void 0 === e2) {
            for (var o2 = [], t2 = 0; t2 < n2._sounds.length; t2++) o2.push(n2._sounds[t2]._id);
            return o2;
          }
          return [e2];
        }, _refreshBuffer: function(e2) {
          var o2 = this;
          return e2._node.bufferSource = n.ctx.createBufferSource(), e2._node.bufferSource.buffer = r[o2._src], e2._panner ? e2._node.bufferSource.connect(e2._panner) : e2._node.bufferSource.connect(e2._node), e2._node.bufferSource.loop = e2._loop, e2._loop && (e2._node.bufferSource.loopStart = e2._start || 0, e2._node.bufferSource.loopEnd = e2._stop || 0), e2._node.bufferSource.playbackRate.setValueAtTime(e2._rate, n.ctx.currentTime), o2;
        }, _cleanBuffer: function(e2) {
          var o2 = this, t2 = n._navigator && n._navigator.vendor.indexOf("Apple") >= 0;
          if (!e2.bufferSource) return o2;
          if (n._scratchBuffer && e2.bufferSource && (e2.bufferSource.onended = null, e2.bufferSource.disconnect(0), t2)) try {
            e2.bufferSource.buffer = n._scratchBuffer;
          } catch (e3) {
          }
          return e2.bufferSource = null, o2;
        }, _clearSound: function(e2) {
          /MSIE |Trident\//.test(n._navigator && n._navigator.userAgent) || (e2.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        } };
        var t = function(e2) {
          this._parent = e2, this.init();
        };
        t.prototype = { init: function() {
          var e2 = this, o2 = e2._parent;
          return e2._muted = o2._muted, e2._loop = o2._loop, e2._volume = o2._volume, e2._rate = o2._rate, e2._seek = 0, e2._paused = true, e2._ended = true, e2._sprite = "__default", e2._id = ++n._counter, o2._sounds.push(e2), e2.create(), e2;
        }, create: function() {
          var e2 = this, o2 = e2._parent, t2 = n._muted || e2._muted || e2._parent._muted ? 0 : e2._volume;
          return o2._webAudio ? (e2._node = void 0 === n.ctx.createGain ? n.ctx.createGainNode() : n.ctx.createGain(), e2._node.gain.setValueAtTime(t2, n.ctx.currentTime), e2._node.paused = true, e2._node.connect(n.masterGain)) : n.noAudio || (e2._node = n._obtainHtml5Audio(), e2._errorFn = e2._errorListener.bind(e2), e2._node.addEventListener("error", e2._errorFn, false), e2._loadFn = e2._loadListener.bind(e2), e2._node.addEventListener(n._canPlayEvent, e2._loadFn, false), e2._endFn = e2._endListener.bind(e2), e2._node.addEventListener("ended", e2._endFn, false), e2._node.src = o2._src, e2._node.preload = true === o2._preload ? "auto" : o2._preload, e2._node.volume = t2 * n.volume(), e2._node.load()), e2;
        }, reset: function() {
          var e2 = this, o2 = e2._parent;
          return e2._muted = o2._muted, e2._loop = o2._loop, e2._volume = o2._volume, e2._rate = o2._rate, e2._seek = 0, e2._rateSeek = 0, e2._paused = true, e2._ended = true, e2._sprite = "__default", e2._id = ++n._counter, e2;
        }, _errorListener: function() {
          var e2 = this;
          e2._parent._emit("loaderror", e2._id, e2._node.error ? e2._node.error.code : 0), e2._node.removeEventListener("error", e2._errorFn, false);
        }, _loadListener: function() {
          var e2 = this, o2 = e2._parent;
          o2._duration = Math.ceil(10 * e2._node.duration) / 10, 0 === Object.keys(o2._sprite).length && (o2._sprite = { __default: [0, 1e3 * o2._duration] }), "loaded" !== o2._state && (o2._state = "loaded", o2._emit("load"), o2._loadQueue()), e2._node.removeEventListener(n._canPlayEvent, e2._loadFn, false);
        }, _endListener: function() {
          var e2 = this, n2 = e2._parent;
          n2._duration === 1 / 0 && (n2._duration = Math.ceil(10 * e2._node.duration) / 10, n2._sprite.__default[1] === 1 / 0 && (n2._sprite.__default[1] = 1e3 * n2._duration), n2._ended(e2)), e2._node.removeEventListener("ended", e2._endFn, false);
        } };
        var r = {}, a = function(e2) {
          var n2 = e2._src;
          if (r[n2]) return e2._duration = r[n2].duration, void i(e2);
          if (/^data:[^;]+;base64,/.test(n2)) {
            for (var o2 = atob(n2.split(",")[1]), t2 = new Uint8Array(o2.length), a2 = 0; a2 < o2.length; ++a2) t2[a2] = o2.charCodeAt(a2);
            d(t2.buffer, e2);
          } else {
            var _2 = new XMLHttpRequest();
            _2.open(e2._xhr.method, n2, true), _2.withCredentials = e2._xhr.withCredentials, _2.responseType = "arraybuffer", e2._xhr.headers && Object.keys(e2._xhr.headers).forEach(function(n3) {
              _2.setRequestHeader(n3, e2._xhr.headers[n3]);
            }), _2.onload = function() {
              var n3 = (_2.status + "")[0];
              if ("0" !== n3 && "2" !== n3 && "3" !== n3) return void e2._emit("loaderror", null, "Failed loading audio file with status: " + _2.status + ".");
              d(_2.response, e2);
            }, _2.onerror = function() {
              e2._webAudio && (e2._html5 = true, e2._webAudio = false, e2._sounds = [], delete r[n2], e2.load());
            }, u(_2);
          }
        }, u = function(e2) {
          try {
            e2.send();
          } catch (n2) {
            e2.onerror();
          }
        }, d = function(e2, o2) {
          var t2 = function() {
            o2._emit("loaderror", null, "Decoding audio data failed.");
          }, a2 = function(e3) {
            e3 && o2._sounds.length > 0 ? (r[o2._src] = e3, i(o2, e3)) : t2();
          };
          "undefined" != typeof Promise && 1 === n.ctx.decodeAudioData.length ? n.ctx.decodeAudioData(e2).then(a2).catch(t2) : n.ctx.decodeAudioData(e2, a2, t2);
        }, i = function(e2, n2) {
          n2 && !e2._duration && (e2._duration = n2.duration), 0 === Object.keys(e2._sprite).length && (e2._sprite = { __default: [0, 1e3 * e2._duration] }), "loaded" !== e2._state && (e2._state = "loaded", e2._emit("load"), e2._loadQueue());
        }, _ = function() {
          if (n.usingWebAudio) {
            try {
              "undefined" != typeof AudioContext ? n.ctx = new AudioContext() : "undefined" != typeof webkitAudioContext ? n.ctx = new webkitAudioContext() : n.usingWebAudio = false;
            } catch (e3) {
              n.usingWebAudio = false;
            }
            n.ctx || (n.usingWebAudio = false);
            var e2 = /iP(hone|od|ad)/.test(n._navigator && n._navigator.platform), o2 = n._navigator && n._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), t2 = o2 ? parseInt(o2[1], 10) : null;
            if (e2 && t2 && t2 < 9) {
              var r2 = /safari/.test(n._navigator && n._navigator.userAgent.toLowerCase());
              n._navigator && !r2 && (n.usingWebAudio = false);
            }
            n.usingWebAudio && (n.masterGain = void 0 === n.ctx.createGain ? n.ctx.createGainNode() : n.ctx.createGain(), n.masterGain.gain.setValueAtTime(n._muted ? 0 : n._volume, n.ctx.currentTime), n.masterGain.connect(n.ctx.destination)), n._setup();
          }
        };
        "function" == typeof define && define.amd && define([], function() {
          return { Howler: n, Howl: o };
        }), "undefined" != typeof exports && (exports.Howler = n, exports.Howl = o), "undefined" != typeof global ? (global.HowlerGlobal = e, global.Howler = n, global.Howl = o, global.Sound = t) : "undefined" != typeof window && (window.HowlerGlobal = e, window.Howler = n, window.Howl = o, window.Sound = t);
      }();
      !function() {
        "use strict";
        HowlerGlobal.prototype._pos = [0, 0, 0], HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0], HowlerGlobal.prototype.stereo = function(e2) {
          var n = this;
          if (!n.ctx || !n.ctx.listener) return n;
          for (var t = n._howls.length - 1; t >= 0; t--) n._howls[t].stereo(e2);
          return n;
        }, HowlerGlobal.prototype.pos = function(e2, n, t) {
          var r = this;
          return r.ctx && r.ctx.listener ? (n = "number" != typeof n ? r._pos[1] : n, t = "number" != typeof t ? r._pos[2] : t, "number" != typeof e2 ? r._pos : (r._pos = [e2, n, t], void 0 !== r.ctx.listener.positionX ? (r.ctx.listener.positionX.setTargetAtTime(r._pos[0], Howler.ctx.currentTime, 0.1), r.ctx.listener.positionY.setTargetAtTime(r._pos[1], Howler.ctx.currentTime, 0.1), r.ctx.listener.positionZ.setTargetAtTime(r._pos[2], Howler.ctx.currentTime, 0.1)) : r.ctx.listener.setPosition(r._pos[0], r._pos[1], r._pos[2]), r)) : r;
        }, HowlerGlobal.prototype.orientation = function(e2, n, t, r, o, i) {
          var a = this;
          if (!a.ctx || !a.ctx.listener) return a;
          var p = a._orientation;
          return n = "number" != typeof n ? p[1] : n, t = "number" != typeof t ? p[2] : t, r = "number" != typeof r ? p[3] : r, o = "number" != typeof o ? p[4] : o, i = "number" != typeof i ? p[5] : i, "number" != typeof e2 ? p : (a._orientation = [e2, n, t, r, o, i], void 0 !== a.ctx.listener.forwardX ? (a.ctx.listener.forwardX.setTargetAtTime(e2, Howler.ctx.currentTime, 0.1), a.ctx.listener.forwardY.setTargetAtTime(n, Howler.ctx.currentTime, 0.1), a.ctx.listener.forwardZ.setTargetAtTime(t, Howler.ctx.currentTime, 0.1), a.ctx.listener.upX.setTargetAtTime(r, Howler.ctx.currentTime, 0.1), a.ctx.listener.upY.setTargetAtTime(o, Howler.ctx.currentTime, 0.1), a.ctx.listener.upZ.setTargetAtTime(i, Howler.ctx.currentTime, 0.1)) : a.ctx.listener.setOrientation(e2, n, t, r, o, i), a);
        }, Howl.prototype.init = /* @__PURE__ */ function(e2) {
          return function(n) {
            var t = this;
            return t._orientation = n.orientation || [1, 0, 0], t._stereo = n.stereo || null, t._pos = n.pos || null, t._pannerAttr = { coneInnerAngle: void 0 !== n.coneInnerAngle ? n.coneInnerAngle : 360, coneOuterAngle: void 0 !== n.coneOuterAngle ? n.coneOuterAngle : 360, coneOuterGain: void 0 !== n.coneOuterGain ? n.coneOuterGain : 0, distanceModel: void 0 !== n.distanceModel ? n.distanceModel : "inverse", maxDistance: void 0 !== n.maxDistance ? n.maxDistance : 1e4, panningModel: void 0 !== n.panningModel ? n.panningModel : "HRTF", refDistance: void 0 !== n.refDistance ? n.refDistance : 1, rolloffFactor: void 0 !== n.rolloffFactor ? n.rolloffFactor : 1 }, t._onstereo = n.onstereo ? [{ fn: n.onstereo }] : [], t._onpos = n.onpos ? [{ fn: n.onpos }] : [], t._onorientation = n.onorientation ? [{ fn: n.onorientation }] : [], e2.call(this, n);
          };
        }(Howl.prototype.init), Howl.prototype.stereo = function(n, t) {
          var r = this;
          if (!r._webAudio) return r;
          if ("loaded" !== r._state) return r._queue.push({ event: "stereo", action: function() {
            r.stereo(n, t);
          } }), r;
          var o = void 0 === Howler.ctx.createStereoPanner ? "spatial" : "stereo";
          if (void 0 === t) {
            if ("number" != typeof n) return r._stereo;
            r._stereo = n, r._pos = [n, 0, 0];
          }
          for (var i = r._getSoundIds(t), a = 0; a < i.length; a++) {
            var p = r._soundById(i[a]);
            if (p) {
              if ("number" != typeof n) return p._stereo;
              p._stereo = n, p._pos = [n, 0, 0], p._node && (p._pannerAttr.panningModel = "equalpower", p._panner && p._panner.pan || e(p, o), "spatial" === o ? void 0 !== p._panner.positionX ? (p._panner.positionX.setValueAtTime(n, Howler.ctx.currentTime), p._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), p._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : p._panner.setPosition(n, 0, 0) : p._panner.pan.setValueAtTime(n, Howler.ctx.currentTime)), r._emit("stereo", p._id);
            }
          }
          return r;
        }, Howl.prototype.pos = function(n, t, r, o) {
          var i = this;
          if (!i._webAudio) return i;
          if ("loaded" !== i._state) return i._queue.push({ event: "pos", action: function() {
            i.pos(n, t, r, o);
          } }), i;
          if (t = "number" != typeof t ? 0 : t, r = "number" != typeof r ? -0.5 : r, void 0 === o) {
            if ("number" != typeof n) return i._pos;
            i._pos = [n, t, r];
          }
          for (var a = i._getSoundIds(o), p = 0; p < a.length; p++) {
            var s = i._soundById(a[p]);
            if (s) {
              if ("number" != typeof n) return s._pos;
              s._pos = [n, t, r], s._node && (s._panner && !s._panner.pan || e(s, "spatial"), void 0 !== s._panner.positionX ? (s._panner.positionX.setValueAtTime(n, Howler.ctx.currentTime), s._panner.positionY.setValueAtTime(t, Howler.ctx.currentTime), s._panner.positionZ.setValueAtTime(r, Howler.ctx.currentTime)) : s._panner.setPosition(n, t, r)), i._emit("pos", s._id);
            }
          }
          return i;
        }, Howl.prototype.orientation = function(n, t, r, o) {
          var i = this;
          if (!i._webAudio) return i;
          if ("loaded" !== i._state) return i._queue.push({ event: "orientation", action: function() {
            i.orientation(n, t, r, o);
          } }), i;
          if (t = "number" != typeof t ? i._orientation[1] : t, r = "number" != typeof r ? i._orientation[2] : r, void 0 === o) {
            if ("number" != typeof n) return i._orientation;
            i._orientation = [n, t, r];
          }
          for (var a = i._getSoundIds(o), p = 0; p < a.length; p++) {
            var s = i._soundById(a[p]);
            if (s) {
              if ("number" != typeof n) return s._orientation;
              s._orientation = [n, t, r], s._node && (s._panner || (s._pos || (s._pos = i._pos || [0, 0, -0.5]), e(s, "spatial")), void 0 !== s._panner.orientationX ? (s._panner.orientationX.setValueAtTime(n, Howler.ctx.currentTime), s._panner.orientationY.setValueAtTime(t, Howler.ctx.currentTime), s._panner.orientationZ.setValueAtTime(r, Howler.ctx.currentTime)) : s._panner.setOrientation(n, t, r)), i._emit("orientation", s._id);
            }
          }
          return i;
        }, Howl.prototype.pannerAttr = function() {
          var n, t, r, o = this, i = arguments;
          if (!o._webAudio) return o;
          if (0 === i.length) return o._pannerAttr;
          if (1 === i.length) {
            if ("object" != typeof i[0]) return r = o._soundById(parseInt(i[0], 10)), r ? r._pannerAttr : o._pannerAttr;
            n = i[0], void 0 === t && (n.pannerAttr || (n.pannerAttr = { coneInnerAngle: n.coneInnerAngle, coneOuterAngle: n.coneOuterAngle, coneOuterGain: n.coneOuterGain, distanceModel: n.distanceModel, maxDistance: n.maxDistance, refDistance: n.refDistance, rolloffFactor: n.rolloffFactor, panningModel: n.panningModel }), o._pannerAttr = { coneInnerAngle: void 0 !== n.pannerAttr.coneInnerAngle ? n.pannerAttr.coneInnerAngle : o._coneInnerAngle, coneOuterAngle: void 0 !== n.pannerAttr.coneOuterAngle ? n.pannerAttr.coneOuterAngle : o._coneOuterAngle, coneOuterGain: void 0 !== n.pannerAttr.coneOuterGain ? n.pannerAttr.coneOuterGain : o._coneOuterGain, distanceModel: void 0 !== n.pannerAttr.distanceModel ? n.pannerAttr.distanceModel : o._distanceModel, maxDistance: void 0 !== n.pannerAttr.maxDistance ? n.pannerAttr.maxDistance : o._maxDistance, refDistance: void 0 !== n.pannerAttr.refDistance ? n.pannerAttr.refDistance : o._refDistance, rolloffFactor: void 0 !== n.pannerAttr.rolloffFactor ? n.pannerAttr.rolloffFactor : o._rolloffFactor, panningModel: void 0 !== n.pannerAttr.panningModel ? n.pannerAttr.panningModel : o._panningModel });
          } else 2 === i.length && (n = i[0], t = parseInt(i[1], 10));
          for (var a = o._getSoundIds(t), p = 0; p < a.length; p++) if (r = o._soundById(a[p])) {
            var s = r._pannerAttr;
            s = { coneInnerAngle: void 0 !== n.coneInnerAngle ? n.coneInnerAngle : s.coneInnerAngle, coneOuterAngle: void 0 !== n.coneOuterAngle ? n.coneOuterAngle : s.coneOuterAngle, coneOuterGain: void 0 !== n.coneOuterGain ? n.coneOuterGain : s.coneOuterGain, distanceModel: void 0 !== n.distanceModel ? n.distanceModel : s.distanceModel, maxDistance: void 0 !== n.maxDistance ? n.maxDistance : s.maxDistance, refDistance: void 0 !== n.refDistance ? n.refDistance : s.refDistance, rolloffFactor: void 0 !== n.rolloffFactor ? n.rolloffFactor : s.rolloffFactor, panningModel: void 0 !== n.panningModel ? n.panningModel : s.panningModel };
            var c = r._panner;
            c || (r._pos || (r._pos = o._pos || [0, 0, -0.5]), e(r, "spatial"), c = r._panner), c.coneInnerAngle = s.coneInnerAngle, c.coneOuterAngle = s.coneOuterAngle, c.coneOuterGain = s.coneOuterGain, c.distanceModel = s.distanceModel, c.maxDistance = s.maxDistance, c.refDistance = s.refDistance, c.rolloffFactor = s.rolloffFactor, c.panningModel = s.panningModel;
          }
          return o;
        }, Sound.prototype.init = /* @__PURE__ */ function(e2) {
          return function() {
            var n = this, t = n._parent;
            n._orientation = t._orientation, n._stereo = t._stereo, n._pos = t._pos, n._pannerAttr = t._pannerAttr, e2.call(this), n._stereo ? t.stereo(n._stereo) : n._pos && t.pos(n._pos[0], n._pos[1], n._pos[2], n._id);
          };
        }(Sound.prototype.init), Sound.prototype.reset = /* @__PURE__ */ function(e2) {
          return function() {
            var n = this, t = n._parent;
            return n._orientation = t._orientation, n._stereo = t._stereo, n._pos = t._pos, n._pannerAttr = t._pannerAttr, n._stereo ? t.stereo(n._stereo) : n._pos ? t.pos(n._pos[0], n._pos[1], n._pos[2], n._id) : n._panner && (n._panner.disconnect(0), n._panner = void 0, t._refreshBuffer(n)), e2.call(this);
          };
        }(Sound.prototype.reset);
        var e = function(e2, n) {
          n = n || "spatial", "spatial" === n ? (e2._panner = Howler.ctx.createPanner(), e2._panner.coneInnerAngle = e2._pannerAttr.coneInnerAngle, e2._panner.coneOuterAngle = e2._pannerAttr.coneOuterAngle, e2._panner.coneOuterGain = e2._pannerAttr.coneOuterGain, e2._panner.distanceModel = e2._pannerAttr.distanceModel, e2._panner.maxDistance = e2._pannerAttr.maxDistance, e2._panner.refDistance = e2._pannerAttr.refDistance, e2._panner.rolloffFactor = e2._pannerAttr.rolloffFactor, e2._panner.panningModel = e2._pannerAttr.panningModel, void 0 !== e2._panner.positionX ? (e2._panner.positionX.setValueAtTime(e2._pos[0], Howler.ctx.currentTime), e2._panner.positionY.setValueAtTime(e2._pos[1], Howler.ctx.currentTime), e2._panner.positionZ.setValueAtTime(e2._pos[2], Howler.ctx.currentTime)) : e2._panner.setPosition(e2._pos[0], e2._pos[1], e2._pos[2]), void 0 !== e2._panner.orientationX ? (e2._panner.orientationX.setValueAtTime(e2._orientation[0], Howler.ctx.currentTime), e2._panner.orientationY.setValueAtTime(e2._orientation[1], Howler.ctx.currentTime), e2._panner.orientationZ.setValueAtTime(e2._orientation[2], Howler.ctx.currentTime)) : e2._panner.setOrientation(e2._orientation[0], e2._orientation[1], e2._orientation[2])) : (e2._panner = Howler.ctx.createStereoPanner(), e2._panner.pan.setValueAtTime(e2._stereo, Howler.ctx.currentTime)), e2._panner.connect(e2._node), e2._paused || e2._parent.pause(e2._id, true).play(e2._id, true);
        };
      }();
    }
  });

  // dist/events/event-bus.js
  var EventBus = class {
    handlers = {};
    // Subscribe to an event
    on(event, handler) {
      if (!this.handlers[event]) {
        this.handlers[event] = [];
      }
      this.handlers[event].push(handler);
    }
    // Unsubscribe from an event
    off(event, handler) {
      if (!this.handlers[event])
        return;
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
      if (this.handlers[event].length === 0) {
        delete this.handlers[event];
      }
    }
    // Emit an event with a payload
    emit(event, payload) {
      console.log("DEBUG: Emitting", event, payload == void 0 ? "no payload" : payload);
      if (!this.handlers[event]) {
        console.log("DEBUG - no event listeners for", event, payload);
      } else {
        for (const handler of this.handlers[event]) {
          handler(payload);
        }
      }
    }
  };
  var eventBus = new EventBus();

  // dist/components/tanda-element.js
  var TandaComponent = class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<p>Tanda Component</p>`;
      eventBus.on("songAdded", (song) => {
        console.log("A new song was added elsewhere:", song);
      });
      eventBus.emit("songAdded", {
        title: "Another from Tanda New Song",
        artist: "Some Artist"
      });
    }
  };
  customElements.define("tanda-element", TandaComponent);

  // dist/services/player.js
  var import_howler_min = __toESM(require_howler_min());

  // dist/services/utils.js
  function formatTime(milliseconds, includeHours = false) {
    const totalSeconds = Math.floor(milliseconds / 1e3);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    const hoursString = includeHours ? `${hours.toString().padStart(2, "0")}:` : "";
    const minutesString = minutes.toString().padStart(2, "0");
    const secondsString = seconds.toString().padStart(2, "0");
    return `${hoursString}${minutesString}:${secondsString}`;
  }

  // dist/services/player.js
  var Player = class _Player {
    options;
    current = null;
    next = null;
    playlistPos = null;
    systemGain;
    progressTimer;
    constructor(options) {
      this.options = options;
      this.systemGain = options.systemLowestGain.meanVolume - options.systemLowestGain.maxVolume;
      console.log("Setting player system gain", this.systemGain, this.options);
      eventBus.on("next-track", this.loadNext.bind(this));
      this.progressTimer = setInterval(this.checkProgress.bind(this), 100);
    }
    checkProgress() {
      if (this.current) {
        const { player, track, ending, silence, state } = this.current;
        if (player) {
          let timeNow = player.seek() * 1e3;
          if (track?.metadata?.end >= 0) {
            let timeEnd = 1e3 * track.metadata.end + Math.min(0, silence ?? 0);
            if (timeNow >= timeEnd - 500 && !ending) {
              this.current.ending = true;
              player.fade(_Player.dBtoLinear(this.current.gainReduction), 0, this.options.fadeRate);
              this.reportProgress("Fading");
              setTimeout(() => {
                if (this.current?.unload) {
                  this.current.unload();
                }
              }, this.options.fadeRate + 1e3);
              player.off("end", this.startNext.bind(this));
              this.startNext();
            } else {
              this.reportProgress(state);
            }
          } else {
            this.reportProgress(state);
          }
        }
      }
    }
    reportProgress(newState) {
      if (!this.current)
        return;
      this.current.state = newState;
      const { player, track, state } = this.current;
      if (player) {
        const pos = !(track.metadata?.end >= 0) ? state == "Stopped" ? 0 : player.seek() * 1e3 : state == "Stopped" ? 0 : Math.min(player.seek() * 1e3 - track.metadata?.start, 1e3 * (track.metadata.end - track.metadata.start));
        const displayName = track.metadata?.end < 0 ? `${state}:  ${this.current.displayName} ( ${formatTime(player.seek() * 1e3)} / ? )` : `${state}: ${this.current.displayName}  ( ${formatTime(pos)} / ${formatTime(1e3 * (track.metadata.end - track.metadata.start))} )`;
        eventBus.emit("track-progress", {
          track,
          pos,
          display: displayName,
          state: newState
        });
      } else {
        if (!this.next?.player) {
          eventBus.emit("track-progress", {
            track: null,
            pos: null,
            display: `Stopped`,
            state: `Stopped`
          });
        }
      }
    }
    static dBtoLinear(dB) {
      return Math.pow(10, dB / 20);
    }
    updatePosition(newPos) {
      console.log("Player - Updating position", newPos, "Was", this.playlistPos);
      if (newPos !== this.playlistPos) {
        this.playlistPos = newPos;
        if (typeof this.next?.unload == "function") {
          this.next.unload();
        }
        this.requestNext(newPos + 1);
      }
    }
    requestNext(N) {
      console.log("Requesting track", N);
      eventBus.emit("track-request", N);
    }
    // Called by event 'next-track'
    async loadNext(payload) {
      try {
        const N = this.playlistPos + 1;
        console.log("Loading next", N);
        const { track, silence } = payload;
        console.log("Told by playlist to use this", track, "Silence: ", silence);
        if (track) {
          const { player, url } = await this.createPlayer(track);
          if (player) {
            track.metadata.end = Math.min(25, track.metadata.end);
            const next = {
              position: N,
              silence,
              track,
              player,
              url,
              gainReduction: track.metadata?.meanVolume ? this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume) : 1,
              displayName: `${track.metadata?.tags?.title || track.fileHandle?.name} / ${track.metadata?.tags?.artist || "unknown"}`,
              state: "Waiting",
              ending: false
            };
            next.unload = () => {
              if (next.player) {
                if (next.player.playing())
                  next.player.stop();
                next.player.unload();
              }
              URL.revokeObjectURL(next.url);
              next.player = null;
              next.unload = null;
            };
            this.next = next;
          }
        } else {
          this.next = null;
        }
      } catch (error) {
        this.next = null;
      }
    }
    get isPlaying() {
      return this.current?.player?.playing();
    }
    get playing() {
      return this.playlistPos;
    }
    async createPlayer(track) {
      try {
        console.log("Trying to create a player", track);
        const url = URL.createObjectURL(await track.fileHandle.getFile());
        const player = new import_howler_min.default({
          src: [url],
          html5: true,
          preload: true,
          autoplay: false
        });
        player.once("load", () => {
          player.seek(track.metadata?.start || 0);
          if (track.metadata?.meanVolume) {
            const reduction = this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume);
            console.log("Using reduction", reduction);
            player.volume(_Player.dBtoLinear(reduction));
          }
        });
        if (track.metadata?.end < 0)
          player.once("end", this.startNext.bind(this));
        console.log("Returning", player, url);
        return { player, url };
      } catch (error) {
        console.error(error);
        eventBus.emit("error", error);
        throw error;
      }
    }
    startNext() {
      if (!this.next)
        return this.reportProgress("Stopped");
      this.current = this.next;
      this.next = null;
      this.playlistPos = this.current.position;
      if (this.current.silence > 0) {
        this.reportProgress("Waiting");
        setTimeout(() => {
          if (this.current?.player) {
            this.reportProgress("Playing");
            this.current.player.play();
            this.checkProgress();
          }
        }, this.current.silence * 1e3);
      } else {
        this.reportProgress("Playing");
        this.current.player.play();
        this.checkProgress();
      }
      this.requestNext(this.playlistPos + 1);
    }
    stop() {
      if (this.isPlaying) {
        this.current.ending = true;
        this.current.player.fade(_Player.dBtoLinear(this.current.gainReduction), 0, this.options.fadeRate);
        this.reportProgress("Fading");
        setTimeout(() => {
          this.reportProgress("Stopped");
          if (this.current.unload) {
            this.current.unload();
          }
        }, this.options.fadeRate + 1e3);
      }
    }
    start() {
      if (!this.isPlaying) {
        this.current.player.play();
      }
    }
    extendEndTime(period) {
      if (this.isPlaying) {
        this.current.track.metadata.end = period;
        this.current.ending = false;
      }
    }
  };

  // dist/services/playlist-service.js
  var PlaylistService = class {
    tandaList;
    trackList;
    constructor() {
      this.tandaList = [];
      this.trackList = [];
      eventBus.on("track-request", this.requestTrack.bind(this));
    }
    setTandas(tandaList) {
      this.tandaList = tandaList;
      this.extractTracks();
      eventBus.emit("new-playlist");
    }
    getTracks() {
      return this.trackList;
    }
    requestTrack(N) {
      eventBus.emit("track-request-result", {
        requested: this.trackList[N],
        previous: N > 0 ? this.trackList[N - 1] : null
      });
    }
    extractTracks() {
      for (let tanda of this.tandaList) {
        for (let track of tanda.tracks) {
          this.trackList.push(track);
        }
      }
    }
  };

  // dist/app.js
  document.addEventListener("DOMContentLoaded", () => {
    eventBus.on("error", (error) => {
      console.error(error);
    });
    let systemLowestGain = { meanVolume: -20, maxVolume: 0 };
    let fadeRate = 3;
    const playerConfig = {
      ctx: null,
      systemLowestGain,
      fadeRate
    };
    const player = new Player(playerConfig);
    const playlistService = new PlaylistService();
    eventBus.on("new-playlist", () => {
      player.updatePosition(-1);
    });
    eventBus.on("track-request-result", async (payload) => {
      await player.loadNext({ track: payload.requested, silence: 0 });
    });
    setTimeout(() => {
      player.startNext();
    }, 3e3);
    const track = {
      fileHandle: {},
      metadata: {
        start: 0,
        end: 0,
        meanVolume: -20,
        maxVolume: 0,
        tags: {
          title: "unknown",
          artist: "unknown"
        }
      }
    };
    const tanda = {
      name: "Dummy",
      style: "Unknown",
      cortina: null,
      tracks: [track, track, track]
    };
    playlistService.setTandas([
      tanda,
      tanda
    ]);
  });
})();
/*! howler.js v2.2.4 | (c) 2013-2020, James Simpson of GoldFire Studios | MIT License | howlerjs.com */
/*! Spatial Plugin */
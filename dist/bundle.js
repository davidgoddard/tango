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
    // Subscribe to an event, but only once
    once(event, handler) {
      const onceHandler = (payload) => {
        handler(payload);
        this.off(event, onceHandler);
      };
      this.on(event, onceHandler);
    }
    // Emit an event with a payload
    emit(event, payload) {
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

  // dist/services/utils.js
  function convert(input) {
    return input.normalize("NFC");
  }
  function formatTime(totalSeconds, includeHours = false) {
    if (totalSeconds < 0) {
      return "?";
    }
    totalSeconds = Math.floor(totalSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    const hoursString = includeHours ? `${hours.toString().padStart(2, "0")}:` : "";
    const minutesString = minutes.toString().padStart(2, "0");
    const secondsString = seconds.toString().padStart(2, "0");
    return `${hoursString}${minutesString}:${secondsString}`;
  }
  function timeStringToSeconds(timeString) {
    if (timeString) {
      const parts = timeString.split(":").map(Number);
      let seconds = 0;
      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      } else {
        return "?";
      }
      return seconds;
    } else {
      return "";
    }
  }
  function renderTrackDetail(idx, track, typeName) {
    let year = track.metadata?.tags?.year;
    if (year) {
      year = year.substring(0, 4);
    }
    return `<${typeName}-element
                  data-type="${typeName.toLowerCase()}"
                  data-tanda-id="${idx}"
                  data-track-id="${String(track.id)}" 
                  data-style="${track.metadata?.style}" 
                  data-title="${track.metadata?.tags?.title}" 
                  data-artist="${track.metadata?.tags?.artist}"
                  data-notes="${track.metadata?.tags?.notes}"
                  data-bpm="${track.metadata?.tags?.bpm}"
                  data-duration="${track.metadata?.end ? formatTime(track.metadata?.end - track.metadata?.start) : ""}"
                  data-year="${year}"
                  data-file="${track.name}"></${typeName}-element>`;
  }
  function createPlaceHolder(typeName, style) {
    return `<${typeName}
                  data-type="${typeName.split("-")[0].toLowerCase()}"
                  data-style="${style}" 
                  data-title="place holder" 
            ></${typeName}>`;
  }
  function getDomElement(selector) {
    return document.querySelector(selector);
  }
  function allTracks(container) {
    return Array.from(container.querySelectorAll(`track-element:not([data-title="place holder"]), cortina-element:not([data-title="place holder"])`));
  }
  function scheduleEventEvery(N, eventFunction) {
    eventFunction();
    const now = /* @__PURE__ */ new Date();
    const millisecondsTillNextMinute = (60 - now.getSeconds()) * 1e3 - now.getMilliseconds();
    function startInterval() {
      eventFunction();
      setInterval(eventFunction, N * 1e3);
    }
    setTimeout(startInterval, millisecondsTillNextMinute);
  }

  // dist/components/tanda.element.js
  var nextId = 1;
  var TandaElement = class extends HTMLElement {
    expanded = false;
    isPlaying = false;
    hasPlayed = false;
    playingTime = "";
    editable = false;
    handleExtendBound;
    handleShrinkBound;
    handleToggleBound;
    handleChangeCortinaBound;
    handleChangeEditBound;
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.handleExtendBound = this.handleExtend.bind(this);
      this.handleShrinkBound = this.handleShrink.bind(this);
      this.handleToggleBound = this.toggleExpand.bind(this);
      this.handleChangeCortinaBound = this.handleChangeCortina.bind(this);
      this.handleChangeEditBound = this.handleEdit.bind(this);
    }
    scheduledPlayingTime(time) {
      this.playingTime = time;
      let timeField = this.shadowRoot?.querySelector("#play-time");
      if (timeField)
        timeField.textContent = this.playingTime;
    }
    connectedCallback() {
      this.dataset.id = "Tanda-" + String(nextId++);
      this.render(true);
      this.draggable = true;
    }
    disconnectedCallback() {
      this.removeEventListeners();
    }
    handleExtend(event) {
      const newTrack = document.createElement("track-element");
      newTrack.dataset.style = this.dataset.style;
      newTrack.dataset.title = "place holder";
      this.appendChild(newTrack);
      this.render();
      eventBus.emit("changed-playlist");
    }
    handleShrink(event) {
      let n = this.children.length;
      if (n > 0)
        this.removeChild(this.children[n - 1]);
      this.render();
      eventBus.emit("changed-playlist");
    }
    handleChangeCortina(event) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Change cortina");
      const newEvent = new CustomEvent("changeCortina", {
        detail: this,
        bubbles: true
      });
      this.dispatchEvent(newEvent);
    }
    handleEdit(event) {
      event.preventDefault();
      event.stopPropagation();
      this.editable = !this.editable;
      console.log("Enable edit");
      const tracks = Array.from(this.querySelectorAll("track-element, cortina-element"));
      tracks.forEach((track) => {
        track.enableEdit(this.editable);
      });
    }
    findMinMaxYears(years) {
      const numericYears = years.map((year) => year ? Number(year) : NaN).filter((year) => !isNaN(year));
      const hasUnknown = years.some((year) => !year);
      if (numericYears.length > 0) {
        const minYear = Math.min(...numericYears);
        const maxYear = Math.max(...numericYears);
        if (minYear !== maxYear) {
          return `(${[
            hasUnknown ? "Unknown" : "",
            "Years " + minYear + " to " + maxYear
          ].filter((x) => x).join(", ")})`;
        } else {
          return `(${[hasUnknown ? "Unknown" : "", "Year " + minYear].filter((x) => x).join(", ")})`;
        }
      } else {
        return "";
      }
    }
    setPlaying(state) {
      this.isPlaying = state;
      if (this.isPlaying) {
        this.classList.add("playing");
        this.draggable = false;
        this.shadowRoot.querySelector("#container article")?.classList.add("playing");
        this.render();
      } else {
        this.classList.remove("playing");
        this.draggable = true;
        this.shadowRoot.querySelector("#container article")?.classList.remove("playing");
        this.render();
      }
    }
    setPlayed(state) {
      this.hasPlayed = state;
      if (this.hasPlayed) {
        this.classList.add("played");
        this.draggable = false;
        this.shadowRoot.querySelector("#container article")?.classList.add("played");
      } else {
        this.classList.remove("played");
        this.draggable = true;
        this.shadowRoot.querySelector("#container article")?.classList.remove("played");
      }
    }
    addEventListeners() {
      this.shadowRoot.querySelector("#extendTanda").addEventListener("click", this.handleExtendBound);
      this.shadowRoot.querySelector("#shrinkTanda").addEventListener("click", this.handleShrinkBound);
      this.shadowRoot.querySelector("#toggle main").addEventListener("click", this.handleToggleBound);
      this.shadowRoot.querySelector("#changeCortinaButton").addEventListener("click", this.handleChangeCortinaBound);
      this.shadowRoot.querySelector("#editContentButton").addEventListener("click", this.handleChangeEditBound);
    }
    removeEventListeners() {
      this.shadowRoot.querySelector("#extendTanda").removeEventListener("click", this.handleExtendBound);
      this.shadowRoot.querySelector("#shrinkTanda").removeEventListener("click", this.handleShrinkBound);
      this.shadowRoot.querySelector("#toggle main").removeEventListener("click", this.handleToggleBound);
      this.shadowRoot.querySelector("#changeCortinaButton").removeEventListener("click", this.handleChangeCortinaBound);
      this.shadowRoot.querySelector("#editContentButton").removeEventListener("click", this.handleChangeEditBound);
    }
    collapse() {
      this.expanded = false;
      this.render();
    }
    render(firstCall = false) {
      if (!firstCall)
        this.removeEventListeners();
      const tracks = Array.from(this.querySelectorAll("track-element"));
      const cortina = Array.from(this.querySelectorAll("cortina-element"));
      const titles = [...tracks, ...cortina].map((track2) => track2.dataset.title).filter((x) => x);
      const titleSet = new Set(titles);
      console.log("Title Set", titleSet);
      const artists = new Set(tracks.map((track2) => track2.dataset.artist).filter((x) => x));
      const years = tracks.map((track2) => track2.dataset.year).filter((x) => x).map((year) => year.substring(0, 4));
      const styles = new Set(tracks.map((track2) => track2.dataset.style)?.filter((x) => x));
      if (styles.size == 0) {
        styles.add(this.dataset.style);
      }
      let duration = 0;
      tracks.forEach((track2) => duration += timeStringToSeconds(track2.dataset.duration));
      let isPlaceHolder = [...titleSet].find((title) => title == "place holder");
      const summary = `(${tracks.length} Tracks; Duration: ${formatTime(duration)}):  ${isPlaceHolder ? "Incomplete!" : ""} ${this.findMinMaxYears(years)} ${[...artists].join(", ")}`;
      const track = cortina[0];
      let cortinaArtist;
      let cortinaTitle;
      if (track) {
        cortinaTitle = track.dataset.title;
        cortinaArtist = track.dataset.artist;
        if (cortinaTitle?.length > 15)
          cortinaTitle = cortinaTitle.substring(0, 15) + "...";
        if (cortinaArtist?.length > 15)
          cortinaArtist = cortinaArtist.substring(0, 15) + "...";
      } else {
        cortinaTitle = "No Cortina";
        cortinaArtist = "";
      }
      const cortinaSummary = cortinaTitle.length > 0 ? `<button id="changeCortinaButton" class="cortinaName">${cortinaTitle}</button>` : "";
      this.shadowRoot.innerHTML = `
            <style>
                * {
                  color: var(--track-text-color)
                  
                }
                .summary { cursor: pointer; display: grid; grid-template-columns: 40px auto;}
                .summary header { display: flex; justify-content: center }
                .summary header span {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .details { 
                  height: 0px; 
                  overflow-y: hidden;
                  transition: height 1s ease-in-out;
                }
                #container {
                  width: 100%;
                }
                #container article.playing {
                  outline: solid 2px orange;
                  margin: 1rem;
                }
                #container article.played {
                  background-color: var(--played-tanda-background);
                  color: var(--played-tanda-foreground);
                }
                #container article.placeHolder {
                  background-color: var(--placeholder-background);
                  outline: dashed 1px red;
                  z-index: 2;
                  position: relative;
                }
                #container article {
                    border: solid 2px #ccc;
                    border-radius: 7px;
                    margin-top: 0rem;
                    margin-bottom: 1px;
                    padding: 0.2rem;
                }
                #actions {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                }
                #actions button {
                    display: flex;
                    align-self: center;
                    padding: 0px;
                    margin-left: 10px;
                    border: none;
                    background: transparent;
                    height: 20px;
                    width: 20px;
                }
                .details.expanded {
                    height: auto;
                    padding: 0.5rem;
                }
                #container.moving article {
                    border: dashed 2px red;
                    margin: 1rem;
                }
                #container.empty article {
                    border: dashed 2px green;
                    margin: 1rem;
                }
                #actions button.target {
                    display: none;
                }
                button img {
                    height: 25px;
                    width: 25px;
                }
                .cortinaControls {
                    display: none;
                }
                .cortinaControls button {
                    border: none;
                    background-color:transparent;
                }
                .cortinaControls img {
                    height: 40px;
                    width: 40px;
                }
                .cortinaControls.active {
                    display: block;
                }

                main > section {
                    float: right;
                    text-align: right;
                    min-width: 8rem;
                }
                main > section > button {
                    width: 100%;
                    margin-bottom: 0.3rem;
                    color: black;
                }
                #extensions {
                  display: flex;
                  justify-content: end;
                }
                #extensions.hidden {
                  display: none;
                }
                #extensions button {
                  font-size: 1rem;
                  border-radius: 50%;
                  border: transparent;
                  background-color: var(--button-background);
                  color: var(--text-color);
                  font-weight: bolder;
                  margin: 0.2rem;
                  padding: 0.4rem;
                  display: flex;
                }
                #extensions button img {
                  height: 25px;
                  width: 25px;
                }

            </style>
            <div id="container" class="${this.hasPlayed ? "played" : ""}">
                <span id="play-time">${this.playingTime ? `${this.playingTime}` : ""}</span>
                <article class="${isPlaceHolder ? "placeHolder" : ""}">
                    <div id="toggle" class="summary">
                        <header>
                            <span>${styles.size == 1 ? [...styles]?.[0]?.charAt(0)?.toUpperCase() : "?"}</span>
                        </header>
                        <main>
                                                     
                            <section>
                                ${cortinaSummary}
                                <section id="actions"></section>
                            </section>

                            <span>${summary}</span>   
                        </main>
                    </div>
                    <div class="details ${this.expanded || this.classList.contains("playing") ? "expanded" : ""}">   
                        <slot></slot>                 
                    </div>
                    <section id="extensions" class="${!(this.expanded || this.classList.contains("playing")) ? "hidden" : ""}">
                      <button id="editContentButton"><img src="./icons/edit.svg"></button>
                      <button id="extendTanda"><img src="./icons/add.svg"></button>
                      <button id="shrinkTanda"><img src="./icons/subtract.svg"></button>
                    </section>
                </article>
            </div>
        `;
      this.addEventListeners();
    }
    toggleExpand() {
      this.expanded = !this.expanded;
      let details = this.shadowRoot.querySelector(".details");
      let extensions = this.shadowRoot.querySelector("#extensions");
      if (this.expanded) {
        details.classList.add("expanded");
        extensions.classList.remove("hidden");
      } else {
        details.classList.remove("expanded");
        extensions.classList.add("hidden");
      }
    }
  };
  customElements.define("tanda-element", TandaElement);

  // dist/services/drag-drop.service.js
  var draggingElement;
  var addDragDropHandlers = (container) => {
    container.addEventListener("dragstart", dragStartHandler);
    container.addEventListener("dragend", dragEndHandler);
    container.addEventListener("dragover", dragOverHandler);
    container.addEventListener("dragleave", dragLeaveHandler);
    container.addEventListener("drop", dragDropHandler);
  };
  function closestParent(node, selector) {
    if (!node) {
      return null;
    }
    if (node instanceof ShadowRoot) {
      return closestParent(node.host, selector);
    }
    if (node instanceof HTMLElement) {
      if (node.matches(selector)) {
        return node;
      } else {
        return closestParent(node.parentNode, selector);
      }
    }
    return closestParent(node.parentNode, selector);
  }
  function isValidDropTarget(source, target) {
    console.log("Is valid", source.tagName, target.tagName, source.dataset.style, target.dataset.style);
    if (closestParent(target, ".results")) {
      return false;
    }
    let valid = sameStyle(source.dataset?.style || "", target.dataset?.style || "");
    return closestParent(target, "SCRATCH-PAD-ELEMENT") !== void 0 || source !== target && source.tagName == target.tagName && valid;
  }
  function sameStyle(a, b) {
    if (a == b)
      return true;
    if (a.charAt(0).toUpperCase() == "U" || b.charAt(0).toUpperCase() == "U")
      return true;
    return false;
  }
  function swapElements(element1, element2) {
    element1.classList.remove("drop-target");
    element2.classList.remove("drop-target");
    const temp = document.createElement("div");
    element1.parentNode.insertBefore(temp, element1);
    element2.parentNode.insertBefore(element1, element2);
    temp.parentNode.insertBefore(element2, temp);
    temp.parentNode.removeChild(temp);
    new Array(element1, element2).forEach((element) => {
      let tanda = element;
      if (tanda.tagName !== "TANDA-ELEMENT") {
        tanda = closestParent(tanda, "tanda-element");
      }
      if (tanda)
        tanda.render();
    });
  }
  function dragStartHandler(event) {
    const target = event.target;
    if (target.matches("[draggable]")) {
      console.log("dragstart", target.dataset.id);
      event.dataTransfer?.setData("text/plain", target.dataset.id);
      draggingElement = target;
    }
  }
  function dragOverHandler(event) {
    event.preventDefault();
    const target = event.target;
    if (isValidDropTarget(draggingElement, target)) {
      target.classList.add("drop-target");
      event.dataTransfer.dropEffect = "move";
    }
  }
  function dragLeaveHandler(event) {
    event.preventDefault();
    const target = event.target;
    target.classList.remove("drop-target");
  }
  function dragDropHandler(event) {
    event.preventDefault();
    document.querySelector(".drop-target")?.classList.remove("drop-target");
    let target;
    target = closestParent(event.target, draggingElement.tagName);
    if (!target) {
      console.log("No target yet - ", event.target);
      if (closestParent(event.target, ".scratchpad-tab-content")) {
        if (closestParent(draggingElement, "#playlistContainer")) {
          const swap = document.createElement(draggingElement.tagName);
          if (draggingElement.tagName === "TANDA-ELEMENT") {
            swap.dataset.style = draggingElement.dataset.style;
            let html = "";
            for (const child of draggingElement.children) {
              html += createPlaceHolder(child.tagName, swap.dataset.style);
            }
            swap.innerHTML = html;
          } else {
            swap.dataset.title = "place holder";
            swap.dataset.style = draggingElement.dataset.style;
          }
          event.target.appendChild(swap);
          swapElements(draggingElement, swap);
        } else {
          console.log("Nearest", closestParent(draggingElement, ".results"));
          if (closestParent(draggingElement, ".results")) {
            event.target.appendChild(draggingElement.cloneNode(true));
          }
        }
        event.target.classList.remove("drop-target");
      }
      eventBus.emit("changed-playlist");
      return;
    }
    console.log("Found drop zone", target, "dragging", draggingElement);
    console.log("Valid?", isValidDropTarget(draggingElement, target));
    if (target) {
      if (draggingElement && isValidDropTarget(draggingElement, target)) {
        console.log("drop", target.id);
        if (closestParent(draggingElement, ".results")) {
          let targetParent = target.parentElement;
          targetParent.insertBefore(draggingElement.cloneNode(true), target);
          const scratchpad = document.querySelector("#scratchPad");
          scratchpad?.appendChild(target);
          console.log("Drop target parent", targetParent);
          if (targetParent.tagName === "TANDA-ELEMENT") {
            targetParent.render();
          }
        } else {
          swapElements(draggingElement, target);
        }
      }
    }
    eventBus.emit("changed-playlist");
  }
  function dragEndHandler(event) {
    const target = event.target;
    if (target.matches("[draggable]")) {
    }
  }

  // dist/components/search.element.js
  var SearchElement = class extends HTMLElement {
    searchInput;
    filterSelect;
    tracksTab;
    tandasTab;
    tracksContent;
    tandasContent;
    tracksCount;
    tandasCount;
    dbManager;
    queryCount = 0;
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          section {
            background-color: var(--background-color);
          }
          .tab-container {
            display: flex;
          }
          .tab {
            flex: 1;
            text-align: center;
            cursor: pointer;
            padding: 8px;
            border: 1px solid #ccc;
            border-bottom: none;
          }
          .tab.active {
            background-color: var(--tab-active);
          }
          .results {
            border: 1px solid #ccc;
            padding: 16px;
          }
          .hidden {
            display: none;
          }
          section {
            display: grid;
            grid-template-rows: auto auto 1fr;
          }
          .scrollable {
            overflow-y: auto;
          }
          track-element, cortina-element, tanda-element {
            display: block;
          }
          .drop-target {
            outline: dashed 2px green;
            z-index: 99;
          }
          
        </style>
        <section>
          <div>
            <label for="search-input">Search:</label>
            <input type="text" id="search-input" placeholder="Enter search string">
            <label for="filter-select">Style:</label>
            <select id="filter-select">
              <option value="all">All</option>
              <option value="rock / pop">Rock / Pop</option>
              <option value="jazz">Jazz</option>
              <option value="tango">Tango</option>
              <option value="waltz">Waltz</option>
              <option value="milonga">Milonga</option>
              <!-- Add more options as needed -->
            </select>
          </div>
          <div class="tab-container">
            <div id="tracks-tab" class="tab active">Tracks (<span id="tracks-count">0</span>)</div>
            <div id="tandas-tab" class="tab">Tandas (<span id="tandas-count">0</span>)</div>
          </div>
          <div class="scrollable">
            <div id="tracks-content" class="results ">
              <!-- Content for tracks -->
            </div>
            <div id="tandas-content" class="results hidden">
              <!-- Content for tandas -->
            </div>
          </div>
        <section>`;
      this.searchInput = this.shadowRoot.querySelector("#search-input");
      this.filterSelect = this.shadowRoot.querySelector("#filter-select");
      this.tracksTab = this.shadowRoot.querySelector("#tracks-tab");
      this.tandasTab = this.shadowRoot.querySelector("#tandas-tab");
      this.tracksContent = this.shadowRoot.querySelector("#tracks-content");
      this.tandasContent = this.shadowRoot.querySelector("#tandas-content");
      this.tracksCount = this.shadowRoot.querySelector("#tracks-count");
      this.tandasCount = this.shadowRoot.querySelector("#tandas-count");
      this.searchInput.addEventListener("input", this.handleSearch.bind(this));
      this.filterSelect.addEventListener("change", this.handleFilter.bind(this));
      this.tracksTab.addEventListener("click", () => this.showContent("tracks"));
      this.tandasTab.addEventListener("click", () => this.showContent("tandas"));
      addDragDropHandlers(this.tandasContent);
      addDragDropHandlers(this.tracksContent);
      this.tracksCount.textContent = "0";
      this.tandasCount.textContent = "0";
      eventBus.on("queryResults", this.results.bind(this));
    }
    setDB(dbManager) {
      this.dbManager = dbManager;
    }
    focus() {
      this.searchInput.focus();
    }
    // Method to handle search input
    handleSearch() {
      const searchData = this.searchInput.value.trim();
      const selectedStyle = this.filterSelect.value;
      eventBus.emit("query", { queryNo: ++this.queryCount, search: this, searchData, selectedStyle });
    }
    // Method to handle filter selection
    handleFilter() {
      this.handleSearch();
    }
    // Method to update search results
    async results(resultset) {
      if (resultset.search !== this)
        return;
      if (resultset.queryNo !== this.queryCount)
        return;
      this.tracksCount.textContent = resultset.tracks.length.toString();
      this.tandasCount.textContent = resultset.tandas.length.toString();
      this.tracksContent.innerHTML = resultset.tracks.map((track) => renderTrackDetail(0, track, "track")).join("");
      let tandasHTML = "";
      for (let idx = 0; idx < resultset.tandas.length; idx++) {
        const tanda = resultset.tandas[idx];
        let html = "";
        if (tanda.cortina) {
          let track = await this.dbManager.getDataByName("cortina", tanda.cortina);
          if (track) {
            html += renderTrackDetail(idx, track, "cortina");
          }
        }
        const styles = /* @__PURE__ */ new Set();
        if (tanda.tracks) {
          for (let trackName of tanda.tracks) {
            let track = await this.dbManager.getDataByName("track", trackName);
            styles.add(track.metadata.style);
            html += renderTrackDetail(idx, track, "track");
          }
        }
        tandasHTML += `<tanda-element data-tanda-id="${idx}" data-style='${styles.size !== 1 ? "unknown" : [...styles][0]}'>
                          ${html}
                      </tanda-element>`;
      }
      this.tandasContent.innerHTML = tandasHTML;
    }
    // Method to show content based on tab clicked
    showContent(tab) {
      if (tab === "tracks") {
        this.tracksTab.classList.add("active");
        this.tandasTab.classList.remove("active");
        this.tracksContent.classList.remove("hidden");
        this.tandasContent.classList.add("hidden");
      } else {
        this.tracksTab.classList.remove("active");
        this.tandasTab.classList.add("active");
        this.tracksContent.classList.add("hidden");
        this.tandasContent.classList.remove("hidden");
      }
    }
  };
  customElements.define("search-element", SearchElement);

  // dist/components/track.element.js
  var nextId2 = 0;
  var BaseTrackElement = class extends HTMLElement {
    isPlaying = false;
    isPlayingOnHeadphones = false;
    actions = /* @__PURE__ */ new Set();
    editable = false;
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.draggable = true;
      this.dataset.id = "T-" + String(nextId2++);
      this.render();
      if (this.dataset.title !== "place holder") {
        this.shadowRoot.querySelector("#headphones").addEventListener("click", this.playOnHeadphones.bind(this));
        this.shadowRoot.querySelector(".track").addEventListener("click", this.handleTrackClick.bind(this));
      }
    }
    enableEdit(state) {
      this.editable = state;
      this.render();
    }
    stopPlayingOnHeadphones() {
      this.isPlayingOnHeadphones = false;
      this.shadowRoot.querySelector("#headphones").classList.remove("playing");
    }
    playOnHeadphones(event) {
      event.stopPropagation();
      event.preventDefault();
      if (!this.isPlayingOnHeadphones) {
        this.isPlayingOnHeadphones = true;
        this.shadowRoot.querySelector("#headphones").classList.add("playing");
      } else {
        this.isPlayingOnHeadphones = false;
        this.shadowRoot.querySelector("#headphones").classList.remove("playing");
      }
      eventBus.emit("playOnHeadphones", {
        element: this,
        playing: this.isPlayingOnHeadphones
      });
    }
    setPlaying(state) {
      this.isPlaying = state;
      this.draggable = !this.isPlaying;
      if (this.isPlaying) {
        this.classList.add("playing");
        this.shadowRoot.querySelector("article")?.classList.add("playing");
      } else {
        this.classList.remove("playing");
        this.shadowRoot.querySelector("article")?.classList.remove("playing");
      }
    }
    handleTrackClick() {
      const trackId = this.dataset.trackId;
      if (trackId) {
        const event = new CustomEvent("clickedTrack", {
          detail: this,
          bubbles: true
        });
        this.dispatchEvent(event);
      }
    }
    render() {
      this.shadowRoot.innerHTML = `
        <style>
        * {
            background-color:transparent;
            color: var(--track-text-color);
        }
        .track {
            padding: 0 0 0 0.4rem;
        }
        header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
        }
        span {
          font-size: 0.85rem;
        }
        span span {
          margin-right: 1rem;
        }

        main span span {
          font-size: 1rem;
        }
        h2 {
            margin: 0px;
            padding: 0px;
            font-size: medium;
        }
        p {
            padding: 0px;
            margin: 0px;
        }
        article {
          border: solid 2px transparent;
          border-radius: 5px;
      }
        article.playing {
            border: solid 2px orange;
            background-color: #f9ede191 !important;
        }
        :host-context(track-element:nth-child(2n)) article{
            background-color: #cececea6;
        }
        :host-context(track-element:nth-child(2n+1)) article{
            background-color: #f9ede1a6;
        }
    //     :host-context(track-element.drop-target) article {
    //       outline: dashed 2px green !important;
    //   }
    //   :host-context(cortina-element.drop-target) article {
    //     outline: dashed 2px green !important;
    // }
  
        button.target {
            display: none;
        }
        button {
            background-color: transparent;
            border: none;
            margin-right: 10px;
        }
        img {
            height: 20px;
            width: 20px;
        }
        section.actions {
            float: right;
        }
        #headphones {
            border: solid 2px transparent;
        }
        #headphones.playing {
            background-color: #00800040;
            border: solid 2px red;
            border-radius: 100%;
        }
        .notes {
          color: lightgray;
        }
        #track-title {
          font-size: 1.1rem;
        }
    </style>
    <article class="track ${this.isPlaying ? "playing" : ""}">
        <header>
        ${this.dataset.title !== "place holder" ? `<button id="headphones" class="${this.isPlayingOnHeadphones ? "playing" : ""}">
            <img src="./icons/headphones.png" alt="Listen on headphones">
        </button>` : "<span></span>"}
        <h2>
        <!--${this.dataset.tandaId ? this.dataset.tandaId : ""}-->
        ${this.tagName === "CORTINA-ELEMENT" ? "(Cortina) " : ""} <span id="track-title">${this.dataset.title}</span></h2>
            <div id="floated">
              ${this.editable || !/undefined|null/.test(this.dataset.bpm) ? `<span>BPM: <span id="bpmValue">${this.dataset.bpm}</span></span>` : ""}
              ${this.editable || !/undefined|null/.test(this.dataset.year) ? `<span>Year: <span id="yearValue">${this.dataset.year}</span></span>` : ""}
              <span>Duration: <span class='duration' title="Duration">${this.dataset.duration}</span></span>                
            </div>
        </header>
        <main>
            <p>                
                ${this.editable || !(this.dataset.style == "undefined") ? `<span><span id="styleValue" class='style' title="Style">${this.dataset.style}</span></span>` : ""}
                <span><span id="artistValue" class='artist' title="Artist">${this.dataset.artist}</span></span>
                ${this.editable || !/undefined|null/.test(this.dataset.notes) ? `<span><span id="notesValue" title="Notes">${this.dataset.notes}</span></span>` : ""}
                </p>
        </main>
    </article>
        `;
      const editableElements = {
        "track-title": "track.metadata.tags.title",
        "bpmValue": "track.metadata.tags.bpm",
        "yearValue": "track.metadata.tags.year",
        "styleValue": "track.metadata.style",
        "artistValue": "track.metadata.tags.artist",
        "notesValue": "track.metadata.tags.notes"
      };
      Object.keys(editableElements).forEach((item) => {
        let element = this.shadowRoot.querySelector("#" + item);
        if (element) {
          element.contentEditable = this.editable ? "true" : "false";
          if (this.editable) {
            element.addEventListener("input", () => {
              console.log("Content changed:", element.innerHTML);
            });
            element.addEventListener("blur", () => {
              console.log("Editing finished:", element.innerHTML);
              eventBus.emit("changeTrackData", {
                field: editableElements[item],
                value: element.textContent,
                trackId: this.dataset.trackId,
                type: this.tagName == "CORTINA-ELEMENT" ? "cortina" : "track"
              });
            });
          }
        }
      });
    }
  };
  var TrackElement = class extends BaseTrackElement {
  };
  var CortinaElement = class extends BaseTrackElement {
  };
  customElements.define("track-element", TrackElement);
  customElements.define("cortina-element", CortinaElement);

  // dist/components/large-list.js
  var template = document.createElement("template");
  template.innerHTML = `
  <style>
    .viewport {
      overflow-y: auto;
      position: relative;
    }
    .content {
      position: relative;
      width: 100%;
    }
    .list-item {
      position: absolute;
      width: 100%;
    }
  </style>
  <div class="viewport" id="viewport">
    <div class="content" id="content"></div>
  </div>
`;
  var LargeListElement = class extends HTMLElement {
    viewport;
    contentDiv;
    itemHeight;
    totalItems;
    buffer;
    ticking;
    itemHeights;
    renderItemFunction;
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));
      this.viewport = shadow.getElementById("viewport");
      this.contentDiv = shadow.getElementById("content");
      this.itemHeight = 50;
      this.totalItems = 0;
      this.buffer = 5;
      this.ticking = false;
      this.itemHeights = new Array(this.totalItems).fill(this.itemHeight);
      this.viewport.addEventListener("scroll", this.onScroll.bind(this));
      window.addEventListener("keydown", this.onKeyDown.bind(this));
    }
    async connectedCallback() {
      this.contentDiv.style.height = `${this.calculateContentHeight()}px`;
      await this.renderItems(0, Math.ceil(this.viewport.clientHeight / this.itemHeight) + this.buffer);
    }
    async setListSize(N) {
      this.totalItems = N;
      this.itemHeights = new Array(this.totalItems).fill(this.itemHeight);
      this.contentDiv.style.height = `${this.calculateContentHeight()}px`;
      await this.renderItems(0, Math.ceil(this.viewport.clientHeight / this.itemHeight) + this.buffer);
    }
    setRenderItem(x) {
      this.renderItemFunction = x;
    }
    measureItemHeight(item) {
      return item.getBoundingClientRect().height;
    }
    calculateContentHeight() {
      return this.itemHeights.reduce((a, b) => a + b, 0);
    }
    updateHeightsAndPositions() {
      const children = Array.from(this.contentDiv.children);
      children.forEach((item, index) => {
        const height = this.measureItemHeight(item);
        this.itemHeights[index] = height;
        const previousHeights = this.itemHeights.slice(0, index).reduce((a, b) => a + b, 0);
        item.style.transform = `translateY(${previousHeights}px)`;
      });
      this.contentDiv.style.height = `${this.calculateContentHeight()}px`;
    }
    async renderItems(startIndex, endIndex) {
      this.contentDiv.replaceChildren();
      if (this.renderItemFunction) {
        let minEnd = Math.min(endIndex, this.totalItems);
        for (let i = startIndex; i <= minEnd; i++) {
          const item = await this.renderItemFunction(i);
          item.className = "list-item";
          this.contentDiv.appendChild(item);
        }
      }
      this.updateHeightsAndPositions();
    }
    async updateVisibleItems() {
      const scrollTop = this.viewport.scrollTop;
      let accumulatedHeight = 0;
      let startIndex = 0;
      for (let i = 0; i < this.itemHeights.length; i++) {
        if (accumulatedHeight + this.itemHeights[i] > scrollTop) {
          startIndex = i;
          break;
        }
        accumulatedHeight += this.itemHeights[i];
      }
      let endIndex = startIndex;
      accumulatedHeight = this.itemHeights[startIndex];
      for (let i = startIndex + 1; i < this.itemHeights.length; i++) {
        if (accumulatedHeight > scrollTop + this.viewport.clientHeight) {
          endIndex = i;
          break;
        }
        accumulatedHeight += this.itemHeights[i];
      }
      await this.renderItems(Math.max(0, startIndex - this.buffer), Math.min(this.totalItems - 1, endIndex + this.buffer));
      this.ticking = false;
    }
    onScroll() {
      if (!this.ticking) {
        requestAnimationFrame(this.updateVisibleItems.bind(this));
        this.ticking = true;
      }
    }
    onKeyDown(event) {
      switch (event.key) {
        case "ArrowDown":
          this.viewport.scrollTop += this.itemHeight;
          break;
        case "ArrowUp":
          this.viewport.scrollTop -= this.itemHeight;
          break;
        case "PageDown":
          this.viewport.scrollTop += this.viewport.clientHeight;
          break;
        case "PageUp":
          this.viewport.scrollTop -= this.viewport.clientHeight;
          break;
        case "Home":
          this.viewport.scrollTop = 0;
          break;
        case "End":
          this.viewport.scrollTop = this.contentDiv.scrollHeight;
          break;
        default:
          break;
      }
    }
  };
  customElements.define("large-list-element", LargeListElement);

  // dist/components/scratch-pad.element.js
  var ScratchPadElement = class extends HTMLElement {
    container;
    draggingElement;
    filterType = "all";
    filterStyle = "";
    shadow;
    pages = [];
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }
    setPages(pageData) {
      this.pages = pageData;
    }
    getPages() {
      return this.pages;
    }
    savePages() {
      localStorage.setItem("scratch pad pages", JSON.stringify(this.getPages()));
    }
    savePageState() {
      this.pages.forEach((page, index) => {
        let content = this.shadow.querySelector(`.scratchpad-tab-content[data-index="${index}"]`);
        if (content) {
          page.content = Array.from(content.querySelectorAll(":scope > *")).map((node) => node.outerHTML);
        }
        this.savePages();
      });
    }
    handleTabEdit(e, tab) {
      const index = tab.dataset.index;
      if (index !== void 0) {
        this.pages[Number(index)].label = tab.textContent?.trim() ?? "";
        this.savePages();
      }
    }
    switchTab(tab) {
      const index = tab.dataset.index;
      this.shadow.querySelectorAll(".tab").forEach((content) => content.classList.remove("active"));
      tab.classList.add("active");
      this.shadow.querySelectorAll(".scratchpad-tab-content").forEach((content) => content.classList.remove("active"));
      this.shadow.querySelector(`.scratchpad-tab-content[data-index="${index}"]`)?.classList.add("active");
    }
    addTab() {
      this.pages.push({ label: "New Page", content: [] });
      this.savePages();
      this.connectedCallback();
      let tabs = this.shadow.querySelectorAll(".tab");
      let index = this.pages.length - 1;
      this.switchTab(tabs[index]);
    }
    connectedCallback() {
      const scratchPadPagesData = JSON.parse(localStorage.getItem("scratch pad pages") ?? `[{"label": "Main", "content": []}]`);
      this.setPages(scratchPadPagesData);
      this.shadow.innerHTML = "";
      this.container = document.createElement("section");
      this.container.appendChild(this.createStyles());
      this.container.appendChild(this.createControls());
      this.shadow.appendChild(this.container);
      this.render();
    }
    getActiveTabContents() {
      return this.shadow.querySelector(".scratchpad-tab-content.active");
    }
    createStyles() {
      const style = document.createElement("style");
      style.textContent = `
        section {
          height: 100%;
          overflow-y: auto; /* Scrollable content area */
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto auto 1fr;
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0.2rem 0.2rem 0.2rem 0.2rem;
          padding: 3px;
        }
        .drop-target {
          outline: dashed 3px green;
          z-index: 99;
        }
        .controls button img {
          height: 32px;
          width: 32px;
        }
        .bin-target {
          outline: dashed 3px green;
          z-index: 99;
        }
        button.bin {
          background-color: transparent;
          margin: 3px;
          border: none;
          color: var(--header-text-color);
          cursor: pointer;
          justify-self: flex-start;
          flex-grow: 0;
          margin-right: 1rem;
          border-radius: 50%;
          background-color: var(--button-background);
          padding: 0.5rem;
        }
        `;
      return style;
    }
    createControls() {
      const controls = document.createElement("div");
      controls.className = "controls";
      const types = document.createElement("div");
      controls.appendChild(types);
      let typeMap = {
        All: "all",
        Tracks: "track-element",
        Cortinas: "cortina-element",
        Tandas: "tanda-element"
      };
      Object.keys(typeMap).forEach((type, idx) => {
        const label = document.createElement("label");
        label.appendChild(document.createTextNode(type));
        const radio = document.createElement("input");
        radio.id = `style-select-radio-${idx}`;
        radio.type = "radio";
        radio.name = "type";
        radio.value = typeMap[type];
        radio.checked = type === "all";
        radio.addEventListener("change", () => this.setFilterType(typeMap[type]));
        label.appendChild(radio);
        types.appendChild(label);
      });
      const styleSelect = document.createElement("select");
      styleSelect.name = "style-filter";
      styleSelect.addEventListener("change", () => this.setFilterStyle(styleSelect.value));
      controls.appendChild(styleSelect);
      this.updateStyleOptions(styleSelect);
      let self = this;
      const bin = document.createElement("button");
      bin.classList.add("bin");
      const binImage = document.createElement("img");
      binImage.src = "./icons/bin.png";
      bin.appendChild(binImage);
      controls.appendChild(bin);
      function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        bin.classList.add("bin-target");
      }
      function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        bin.classList.remove("bin-target");
      }
      function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log("Bin handling drop");
        const id = event.dataTransfer.getData("text/plain");
        if (id?.startsWith("TAB-")) {
          let index = id.split("-")[1];
          console.log("Tab?", index, self.draggingElement);
          console.log(self.pages[Number(index)]);
          self.pages.splice(Number(index), 1);
          console.log("New pages", self.pages);
          self.savePages();
          self.connectedCallback();
        } else {
          console.log("ID", id);
          const element = document.querySelector(`[data-id="${id}"]`) || self.shadow.querySelector(`[data-id="${id}"]`);
          console.log(element);
          if (element) {
            element.remove();
          }
        }
        bin.classList.remove("bin-target");
        self.savePageState();
        document.querySelector(".drop-target")?.classList.remove("drop-target");
        self.shadow.querySelector(".drop-target")?.classList.remove("drop-target");
        eventBus.emit("changed-playlist");
      }
      bin.addEventListener("dragleave", handleDragLeave);
      bin.addEventListener("dragover", handleDragOver);
      bin.addEventListener("drop", handleDrop.bind(this));
      bin.addEventListener("click", () => {
        this.innerHTML = "";
      });
      return controls;
    }
    updateStyleOptions(selectElement) {
      const styles = Array.from(this.querySelectorAll("tanda-element, track-element, cortina-element")).map((el) => el.dataset.style);
      const uniqueStyles = Array.from(new Set(styles));
      console.log("debug styles", styles, uniqueStyles);
      selectElement.innerHTML = '<option name="all-styles" value="">All styles</option>';
      uniqueStyles.forEach((style) => {
        const option = document.createElement("option");
        option.value = style;
        option.textContent = style;
        selectElement.appendChild(option);
      });
    }
    setFilterType(type) {
      this.filterType = type;
      this.render();
    }
    setFilterStyle(style) {
      this.filterStyle = style;
      this.render();
    }
    render() {
      const style = `
    <style>
        .tabs { display: flex; flex-direction: row; flex-wrap: wrap; border-bottom: 1px solid #ccc; height: min-content; }
        .tab { 
          position: relative;
          padding: 0px 20px;
          cursor: pointer;
          border: 1px solid #ccc;
          border-bottom: none;
          background-color: #f0f0f0;
          transition: background-color 0.3s;
          color: black;          
        }
        .tab span {
          line-height: 2rem;
        }
        .tab:hover, .tab.active {
          background-color: var(--tab-active);
        }
        .scratchpad-tab-content { display: none; padding: 10px; height: 100%; flex-direction: column; }
        .scratchpad-tab-content.active { display: flex; margin: 3px;}
        .tab.delete, .tab.add { }
        .tab.add { background-color: transparent; border: none; }
        .tab span[contenteditable]:hover { background: #f0f0f0; }

    </style>
`;
      const tabs = this.pages.map((page, index) => `
    <div draggable="true" data-index="${index}"  class="tab" ><span contenteditable="true" >
        ${page.label}
    </span></div>
`).join("");
      const tabContents = this.pages.map((page, index) => `
    <div class="scratchpad-tab-content" data-index="${index}">
            ${page.content.join("")}
    </div>
`).join("");
      let template2 = document.createElement("template");
      template2.innerHTML = `
    ${style}
      <div class="tabs">
          ${tabs}
          <div class="tab add"><span>\u2795</span></div>
      </div>
      ${tabContents}
`;
      this.container.appendChild(template2.content.cloneNode(true));
      let tabElements = this.shadow.querySelectorAll(".tab, .tab span");
      tabElements.forEach((tab) => {
        tab.addEventListener("click", () => this.switchTab(tab));
        tab.addEventListener("input", (e) => this.handleTabEdit(e, tab));
        tab.addEventListener("dragstart", (event) => {
          const target = event.target;
          if (target.matches("[draggable]")) {
            console.log("dragstart", target.dataset.index);
            event.dataTransfer?.setData("text/plain", "TAB-" + target.dataset.index);
            this.draggingElement = target;
          }
        });
        tab.addEventListener("dragend", (event) => {
          this.draggingElement = void 0;
        });
      });
      this.shadow.querySelector(".add")?.addEventListener("click", () => this.addTab());
      let tabHeadings = this.shadow.querySelectorAll(".tab");
      tabHeadings[0]?.classList.add("active");
      let tabContainers = this.shadow.querySelectorAll(".scratchpad-tab-content");
      tabContainers[0]?.classList.add("active");
      for (const content of tabContainers) {
        addDragDropHandlers(content);
        content.addEventListener("drop", this.savePageState.bind(this));
      }
      const children = Array.from(this.children);
      children.forEach((child) => {
        const type = child.tagName.toLowerCase();
        const style2 = child.dataset.style;
        const matchesType = this.filterType === "all" || this.filterType === type;
        console.log(type, matchesType, this.filterType, type);
        const matchesStyle = !this.filterStyle || this.filterStyle === style2;
        child.style.display = matchesType && matchesStyle ? "" : "none";
      });
    }
  };
  customElements.define("scratch-pad-element", ScratchPadElement);

  // dist/components/tabs.component.js
  var TabsContainer = class {
    container;
    tabs;
    constructor(container, tabs) {
      this.container = container;
      this.tabs = tabs;
      this.render();
    }
    render() {
      this.container.innerHTML = `
        <ul class="tab-list" role="tablist">
          ${this.tabs.map((label, idx) => {
        return `<li class="tab ${idx == 0 ? "active" : ""}" id="tab${idx + 1}" role="tab">${label}</li>`;
      }).join("")}
        </ul>
        <div class="tab-panels">
          ${this.tabs.map((label, idx) => {
        return `<div class="tab-panel ${idx == 0 ? "" : "hidden"}" id="tab${idx + 1}-panel" role="tabpanel">
            <!-- Content for Tab ${idx + 1} -->
            <search-element></search-element>
          </div>
`;
      }).join("")}
      </div>
`;
    }
  };
  var SearchTabsContainer = class extends TabsContainer {
    dbManager;
    constructor(container, tabs, dbManager) {
      super(container, tabs);
      this.dbManager = dbManager;
    }
    render() {
      super.render();
      const searchComponents = Array.from(document.querySelectorAll("search-element"));
      searchComponents.forEach((search) => search.setDB(this.dbManager));
      const tabs = Array.from(this.container.querySelectorAll(".tab"));
      const panels = Array.from(this.container.querySelectorAll(".tab-panel"));
      tabs.map((tab, idx) => tab.addEventListener("click", () => {
        tabs.forEach((tab2) => tab2.classList.remove("active"));
        tab.classList.add("active");
        const childPanel = panels[idx];
        panels.forEach((panel) => panel.classList.add("hidden"));
        childPanel.classList.remove("hidden");
        childPanel?.querySelector("search-element")?.focus();
      }));
    }
  };

  // dist/services/themes.js
  function switchTheme(theme) {
    const body = document.body;
    body.classList.remove("light-theme", "dark-theme");
    body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }
  function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      switchTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        switchTheme("dark-theme");
      } else {
        switchTheme("light-theme");
      }
    }
  }
  document.getElementById("light-theme-btn").addEventListener("click", () => switchTheme("light-theme"));
  document.getElementById("dark-theme-btn").addEventListener("click", () => switchTheme("dark-theme"));
  window.addEventListener("load", loadTheme);

  // dist/services/player.js
  var import_howler_min = __toESM(require_howler_min());
  var Player = class _Player {
    options;
    current = null;
    next = null;
    playlistPos = null;
    systemGain = 0;
    constructor(options) {
      this.options = options;
      this.updateOptions(options);
      setInterval(this.checkProgress.bind(this), 250);
    }
    updateOptions(newOptions) {
      this.options = newOptions;
      this.systemGain = this.options.systemLowestGain.meanVolume - this.options.systemLowestGain.maxVolume;
    }
    checkProgress() {
      if (this.current) {
        const { player, track, ending, silence, state, gainReduction } = this.current;
        if (player) {
          let timeNow = player.seek() * 1e3;
          if (track?.metadata?.end >= 0) {
            let timeEnd = 1e3 * track.metadata.end + Math.min(0, silence ?? 0);
            if (timeNow >= timeEnd - 500 && !ending) {
              this.current.ending = true;
              player.fade(this.options.useSoundLevelling ? _Player.dBtoLinear(gainReduction) : 1, 0, this.options.fadeRate * 1e3);
              this.reportProgress("Fading");
              let obj = this.current;
              setTimeout(() => {
                player.off("end", this.startNext.bind(this));
                if (obj.unload) {
                  obj.unload();
                }
              }, this.options.fadeRate * 1e3 + 1e3);
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
        const displayName = track.metadata?.end < 0 ? `${state}:  ${this.current.displayName} ( ${formatTime(player.seek())} / ? )` : `${state}: ${this.current.displayName}  ( ${formatTime(pos / 1e3)} / ${formatTime(track.metadata.end - track.metadata.start)} )`;
        if (this.options.progress) {
          this.options.progress({
            track,
            pos,
            display: displayName,
            state: newState
          });
        }
      } else {
        if (!this.next?.player) {
          if (this.options.progress) {
            this.options.progress({
              track: null,
              pos: null,
              display: `Stopped`,
              state: `Stopped`
            });
          }
        }
      }
    }
    static dBtoLinear(dB) {
      return Math.pow(10, dB / 20);
    }
    async updatePosition(newPos) {
      this.playlistPos = newPos;
      if (typeof this.next?.unload == "function") {
        this.next.unload();
      }
      await this.loadNext();
    }
    // Called by event 'next-track'
    async loadNext() {
      try {
        const N = this.playlistPos + 1;
        const { track, silence } = await this.options.fetchNext(N);
        if (track) {
          track.metadata.originalEnd = track.metadata.end;
          track.metadata.end = 10;
          const { player, url } = await this.createPlayer(N, track);
          if (player) {
            const next = {
              position: N,
              silence,
              track,
              player,
              url,
              gainReduction: track.metadata?.meanVolume !== null && track.metadata?.meanVolume !== void 0 ? this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume) : 1,
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
            if (this.options.notify)
              this.options.notify("next-track-ready");
          }
        } else {
          this.next = null;
        }
      } catch (error) {
        eventBus.emit("error", error);
        this.next = null;
      }
    }
    get isPlaying() {
      return this.current?.player?.playing();
    }
    get playing() {
      return this.playlistPos;
    }
    async createPlayer(N, track) {
      try {
        const url = URL.createObjectURL(await track.fileHandle.getFile());
        const howlerConfig = {
          src: [url],
          html5: true,
          preload: true,
          autoplay: false,
          ctx: this.options.ctx,
          onplay: () => {
            if (this.options.notify)
              this.options.notify("startingPlaying", {
                player: this,
                track,
                N
              });
          },
          onstop: () => {
            if (this.options.notify)
              this.options.notify("stoppedPlaying", {
                player: this,
                track,
                N
              });
          }
        };
        const player = new import_howler_min.Howl(howlerConfig);
        player.once("load", async () => {
          if (this.options.ctx) {
            try {
              const audioElement = player._sounds[0]._node;
              if (typeof audioElement.setSinkId === "function") {
                await audioElement.setSinkId(this.options.ctx);
              }
            } catch (error) {
              console.error(error, this.options.ctx);
            }
          }
          player.seek(track.metadata?.start || 0);
          if (track.metadata?.end < 0) {
            track.metadata.end = player.duration();
            track.metadata.end = Math.min(20, track.metadata.end);
          }
          if (this.options.useSoundLevelling && track.metadata?.meanVolume !== null && track.metadata?.meanVolume !== void 0) {
            const reduction = this.systemGain - (track.metadata.meanVolume - track.metadata.maxVolume);
            player.volume(_Player.dBtoLinear(reduction));
          }
        });
        if (track.metadata?.end < 0)
          player.once("end", this.startNext.bind(this));
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
      if (this.current?.track.type == "cortina") {
        if (this.options.notify)
          this.options.notify("tanda");
      }
      this.current = this.next;
      this.next = null;
      this.playlistPos = this.current.position;
      if (this.current.track.type == "cortina") {
        if (this.options.notify)
          this.options.notify("cortina");
      }
      if (this.current.silence > 0) {
        this.reportProgress("Waiting");
        setTimeout(() => {
          if (this.current?.player) {
            this.reportProgress("Playing");
            this.current.player.play();
          }
        }, this.current.silence * 1e3);
      } else {
        this.reportProgress("Playing");
        this.current.player.play();
      }
      this.loadNext();
    }
    stop() {
      if (this.isPlaying) {
        this.current.ending = true;
        this.current.player.fade(this.options.useSoundLevelling ? _Player.dBtoLinear(this.current.gainReduction) : 1, 0, this.options.fadeRate * 1e3);
        this.reportProgress("Fading");
        let obj = this.current;
        setTimeout(() => {
          this.reportProgress("Stopped");
          if (obj.unload) {
            obj.unload();
          }
        }, this.options.fadeRate * 1e3 + 1e3);
      }
    }
    start() {
      if (!this.isPlaying) {
        this.current.player.play();
      }
    }
    extendEndTime(period) {
      if (this.isPlaying) {
        this.current.track.metadata.end = period == -1 ? this.current.track.metadata.originalEnd : period;
        this.current.ending = false;
      }
    }
  };

  // dist/components/schedule.element.js
  var ScheduleElement = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
            .tanda {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .time {
                margin-right: 10px;
                font-weight: bold;
            }
        `;
      this.shadowRoot.appendChild(style);
    }
    connectedCallback() {
      this.render();
    }
    render() {
      const container = document.createElement("div");
      let currentTime = /* @__PURE__ */ new Date();
      Array.from(this.children).forEach((tanda, index) => {
        const tandaWrapper = document.createElement("div");
        tandaWrapper.classList.add("tanda");
        const timeElement = document.createElement("div");
        timeElement.classList.add("time");
        timeElement.textContent = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        tandaWrapper.appendChild(timeElement);
        tandaWrapper.appendChild(tanda.cloneNode(true));
        container.appendChild(tandaWrapper);
        const clone = tandaWrapper.querySelector("tanda-element");
        const duration = parseInt(clone.dataset.duration || "0", 10);
        console.log(JSON.stringify(clone), duration);
        currentTime.setMinutes(currentTime.getMinutes() + duration);
      });
      this.shadowRoot.innerHTML = "";
      this.shadowRoot.appendChild(container);
    }
  };
  customElements.define("schedule-element", ScheduleElement);

  // dist/services/playlist-service.js
  var PlaylistService = class {
    container;
    getDetail;
    constructor(container, getDetail) {
      this.container = container;
      this.getDetail = getDetail;
      eventBus.on("startingPlaying", this.markPlaying.bind(this));
      eventBus.on("stoppedPlaying", this.unmarkPlaying.bind(this));
      addDragDropHandlers(container);
    }
    playingCortina(state) {
      if (state) {
        if (!this.showingCortinaControls()) {
          getDomElement(".cortina-grouped-items").classList.add("active");
          getDomElement("#playAll").classList.add("active");
        }
      } else {
        getDomElement(".cortina-grouped-items").classList.remove("active");
      }
    }
    showingCortinaControls() {
      return getDomElement(".cortina-grouped-items").classList.contains("active");
    }
    // Detail contains N - nth track in playlist
    markPlaying(details) {
      let all = this.allTracks;
      const trackElement = all[details.N];
      all.forEach((track) => track.setPlaying(false));
      trackElement.setPlaying(true);
      const tandaElement = trackElement.closest("tanda-element");
      tandaElement.setPlaying(true);
      const total = Array.from(tandaElement.querySelectorAll("track-element"));
      const playing = 1 + total.findIndex((item) => item.classList.contains("playing"));
      console.log(`Playing ${playing}/${total.length}`);
      const allTandas = Array.from(this.container.querySelectorAll("tanda-element"));
      let tandaN = allTandas.findIndex((tanda) => tanda == tandaElement);
      for (let i = 0; i < allTandas.length; i++) {
        allTandas[i].setPlayed(i < tandaN);
        allTandas[i].setPlaying(i == tandaN);
      }
    }
    unmarkPlaying(details) {
      const trackElement = this.allTracks[details.N];
      console.log("Found track to unmark as playing", trackElement);
      trackElement.setPlaying(false);
    }
    async setTandas(tandaList) {
      console.log("Tanda list", tandaList);
      this.container.innerHTML = (await Promise.all(tandaList.map(async (tanda, idx) => {
        const cortinaElement = tanda.cortina ? (async () => {
          let track = await this.getDetail("cortina", tanda.cortina);
          return renderTrackDetail(idx, track, "cortina");
        })() : "";
        const styles = /* @__PURE__ */ new Set();
        const trackElements = await Promise.all(tanda.tracks.map(async (trackName) => {
          let track = await this.getDetail("track", trackName);
          styles.add(track.metadata.style);
          return renderTrackDetail(idx, track, "track");
        }));
        return `<tanda-element data-tanda-id="${idx}" data-style='${styles.size != 1 ? "unknown" : [...styles][0]}'>
                        ${await cortinaElement}
                        ${trackElements.join("")}
                    </tanda-element>`;
      }))).join("");
    }
    get allTracks() {
      return allTracks(this.container);
    }
    async fetch(N) {
      const trackElement = this.fetchElement(N);
      return await this.getDetail(trackElement.dataset.type, trackElement.dataset.file);
    }
    fetchElement(N) {
      return this.allTracks[N];
    }
    getN(track) {
      return this.allTracks.findIndex((t) => t == track);
    }
    getNowPlayingN() {
      const playing = this.container.querySelector("track-element.playing, cortina-element.playing");
      return this.getN(playing);
    }
  };

  // dist/services/database.js
  var IndexedDBManager = class {
    dbName = "Tanda Player Database";
    dbVersion = 1;
    // Increment this for upgrades
    db = null;
    docVectors = /* @__PURE__ */ new Map();
    trigramIndex = /* @__PURE__ */ new Map();
    constructor() {
      console.log("Created Database object");
    }
    async resetDatabase() {
      console.log("Closing the database");
      if (this.db) {
        this.db.close();
      }
      console.log("Removing the database");
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      deleteRequest.onsuccess = () => {
        console.log("Database deleted successfully");
      };
      deleteRequest.onerror = () => {
        console.error("Error deleting database");
      };
      await this.init();
    }
    init() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          const errorMsg = "IndexedDB is not supported by this browser.";
          console.error(errorMsg);
          reject(errorMsg);
        }
        const request = indexedDB.open(this.dbName, this.dbVersion);
        request.onerror = (event) => {
          console.error("Database error: " + event.target.error?.message);
          reject(event.target.error);
        };
        request.onupgradeneeded = (event) => {
          console.log("Upgrade needed");
          const db = event.target.result;
          const tables = [
            "system",
            "track",
            "cortina",
            "tanda",
            "scratchpad",
            "playlist"
          ];
          tables.forEach((table) => {
            let objectStore2;
            if (!db.objectStoreNames.contains(table)) {
              objectStore2 = db.createObjectStore(table, {
                keyPath: "id",
                autoIncrement: true
              });
            } else {
              objectStore2 = event.target.transaction?.objectStore(table);
            }
            if (table === "track" || table === "cortina") {
              if (!objectStore2.indexNames.contains("name")) {
                objectStore2.createIndex("name", "name", { unique: true });
              }
            }
            if (table === "playlist") {
              if (!objectStore2.indexNames.contains("name")) {
                objectStore2.createIndex("name", "name", { unique: true });
              }
            }
          });
          let objectStore;
          if (!db.objectStoreNames.contains("records")) {
            objectStore = db.createObjectStore("records", {
              keyPath: "id"
            });
          } else {
            objectStore = event.target.transaction?.objectStore("records");
          }
          if (!db.objectStoreNames.contains("trigrams")) {
            objectStore = db.createObjectStore("trigrams", {
              keyPath: "trigram"
            });
          } else {
            objectStore = event.target.transaction?.objectStore("trigrams");
          }
        };
        request.onsuccess = (event) => {
          console.log("Success in opening database");
          this.db = event.target.result;
          resolve(this);
        };
      });
    }
    async cacheIndexData() {
      const transaction = this.db?.transaction(["records"], "readonly");
      const recordsStore = transaction?.objectStore("records");
      const recordsRequest = recordsStore?.getAll();
      recordsRequest.onsuccess = () => {
        const records = recordsRequest.result;
        records.forEach((record) => {
          if (record.vector)
            this.docVectors.set(record.id, new Map(Object.entries(record.vector)));
        });
      };
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
      });
    }
    addToMemoryIndex(id, content) {
      const tokens = this.tokenize(content);
      const tf = /* @__PURE__ */ new Map();
      tokens.forEach((token) => {
        const trigrams = this.generateTrigrams("__" + token + "__");
        trigrams.forEach((trigram) => {
          if (!tf.has(trigram)) {
            tf.set(trigram, 0);
          }
          tf.set(trigram, tf.get(trigram) + 1 / token.length);
          if (!this.trigramIndex.has(trigram)) {
            this.trigramIndex.set(trigram, /* @__PURE__ */ new Set());
          }
          this.trigramIndex.get(trigram).add(id);
        });
      });
      const length = Math.sqrt(Array.from(tf.values()).reduce((sum, val) => sum + val * val, 0));
      const normalizedTf = /* @__PURE__ */ new Map();
      tf.forEach((value, key) => {
        normalizedTf.set(key, value / length);
      });
      this.docVectors.set(id, normalizedTf);
    }
    async index(data) {
      const content = [
        data.id,
        data.label,
        data.name,
        data.metadata?.tags?.artist,
        data.metadata?.tags?.title,
        data.metadata?.tags?.year,
        data.metadata?.tags?.notes
      ].filter((x) => x).join(" ").toLowerCase();
      this.addToMemoryIndex(`${data.type}-${data.id}-${data.name}`, convert(content));
    }
    // Helper function to tokenize a string into words
    tokenize(text) {
      return text.split(/\s+/);
    }
    // Helper function to generate trigrams from a word
    generateTrigrams(word) {
      const trigrams = [];
      for (let i = 0; i <= word.length - 3; i++) {
        trigrams.push(word.substring(i, i + 3));
      }
      return trigrams;
    }
    async commitChanges() {
      const transaction = this.db?.transaction(["records", "trigrams"], "readwrite");
      const recordsStore = transaction?.objectStore("records");
      const trigramsStore = transaction?.objectStore("trigrams");
      this.docVectors.forEach((vector, id) => {
        recordsStore?.put({ id, vector: Object.fromEntries(vector) });
      });
      this.trigramIndex.forEach((recordIds, trigram) => {
        trigramsStore?.put({ trigram, recordIds: Array.from(recordIds) });
      });
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
      });
    }
    calculateCosineSimilarity(vectorA, vectorB) {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      vectorA.forEach((value, key) => {
        dotProduct += value * (vectorB.get(key) || 0);
        normA += value * value;
      });
      vectorB.forEach((value) => {
        normB += value * value;
      });
      if (normA === 0 || normB === 0)
        return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async search(query) {
      const tokens = this.tokenize(query.toLowerCase());
      const tf = /* @__PURE__ */ new Map();
      tokens.forEach((token) => {
        const trigrams = this.generateTrigrams("__" + token + "__");
        trigrams.forEach((trigram) => {
          if (!tf.has(trigram)) {
            tf.set(trigram, 0);
          }
          tf.set(trigram, tf.get(trigram) + 1 / token.length);
        });
      });
      const length = Math.sqrt(Array.from(tf.values()).reduce((sum, val) => sum + val * val, 0));
      const normalizedTf = /* @__PURE__ */ new Map();
      tf.forEach((value, key) => {
        normalizedTf.set(key, value / length);
      });
      const results = [];
      this.docVectors.forEach((docVector, id) => {
        const score = this.calculateCosineSimilarity(normalizedTf, docVector);
        if (score > 0) {
          results.push({ id, score });
        }
      });
      results.sort((a, b) => b.score - a.score);
      return results;
    }
    async updateData(table, id, updates) {
      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction([table], "readwrite");
        const store = transaction?.objectStore(table);
        const getRequest = store?.get(id);
        getRequest.onsuccess = () => {
          const data = getRequest.result;
          if (data) {
            Object.assign(data, updates);
            const putRequest = store.put(data);
            putRequest.onsuccess = () => {
              if (["track", "cortina", "tanda"].includes(table)) {
                this.index(data);
              }
              resolve(putRequest.result);
            };
            putRequest.onerror = (event) => {
              console.error("Error updating data: ", event.target.error);
              reject(event.target.error);
            };
          } else {
            reject(new Error("Record not found"));
          }
        };
        getRequest.onerror = (event) => {
          console.error("Error retrieving data to update: ", event.target.error);
          reject(event.target.error);
        };
      });
    }
    async addData(table, data) {
      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction([table], "readwrite");
        const store = transaction?.objectStore(table);
        const request = store?.add(data);
        request.onsuccess = () => {
          if (["track", "cortina", "tanda"].includes(table)) {
            this.index(data);
          }
          resolve(request.result);
        };
        request.onerror = (event) => {
          console.error("Data causing error: ", table, data);
          console.error("Error adding data: ", event.target.error);
          reject(event.target.error);
        };
      });
    }
    async getDataById(table, id) {
      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction([table]);
        const store = transaction?.objectStore(table);
        const request = store?.get(id);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = (event) => {
          console.error("Error fetching data: ", event.target.error);
          reject(event.target.error);
        };
      });
    }
    async clearAllData(table) {
      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction([table], "readwrite");
        const store = transaction?.objectStore(table);
        const request = store?.clear();
        request.onsuccess = () => {
          resolve();
        };
        request.onerror = (event) => {
          console.error("Error fetching data: ", event.target.error);
          reject(event.target.error);
        };
      });
    }
    async getDataByName(table, name) {
      return new Promise((resolve, reject) => {
        const transaction = this.db?.transaction([table]);
        const store = transaction?.objectStore(table);
        const index = store?.index("name");
        const request = index?.get(name);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = (event) => {
          console.error("Error fetching data by name: ", event.target.error);
          reject(event.target.error);
        };
      });
    }
    async exportAllData() {
      const transaction = this.db?.transaction(Array.from(this.db?.objectStoreNames || []), "readonly");
      const data = {};
      const getAllRecords = (store) => {
        return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      };
      for (const name of Array.from(this.db?.objectStoreNames || [])) {
        const store = transaction?.objectStore(name);
        data[name] = await getAllRecords(store);
      }
      return JSON.stringify(data);
    }
    async processEntriesInBatches(table, filterFunction, batchSize = 500) {
      return new Promise((resolve, reject) => {
        const results = [];
        const transaction = this.db?.transaction([table]);
        const store = transaction?.objectStore(table);
        let totalCount = 0;
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function() {
          const allRecords = getAllRequest.result;
          totalCount = allRecords.length;
          let processedCount = 0;
          let startIndex = 0;
          const processNextBatch = () => {
            const endIndex = Math.min(startIndex + batchSize, totalCount);
            console.log("Another batch", startIndex, endIndex);
            const batch = allRecords.slice(startIndex, endIndex);
            const filteredBatch = batch.filter(filterFunction);
            results.push(...filteredBatch);
            processedCount += filteredBatch.length;
            startIndex += batchSize;
            if (startIndex < totalCount) {
              setTimeout(processNextBatch, 0);
            } else {
              console.log("All entries processed");
              resolve(results);
            }
          };
          processNextBatch();
        };
        getAllRequest.onerror = function(event) {
          console.error("Error retrieving all records: ", event.target.errorCode);
          reject(event.target);
        };
      });
    }
  };
  var databaseManagerInstance = null;
  var initializationPromise = null;
  var initializeDatabaseManager = async () => {
    if (!initializationPromise) {
      initializationPromise = new Promise(async (resolve) => {
        const manager = new IndexedDBManager();
        await manager.init();
        console.log("Database initialized");
        databaseManagerInstance = manager;
        resolve(manager);
      });
    }
    return initializationPromise;
  };
  var DatabaseManager = async () => {
    return await initializeDatabaseManager();
  };
  console.log("Running database module");

  // dist/services/file-system.js
  var CONFIG_ID = 1;
  async function selectFolder() {
    if (!window.showDirectoryPicker) {
      alert("The File System Access API is not supported in your browser.");
      throw new Error("User has not given access to folder.");
    }
    try {
      const directoryHandle = await window.showDirectoryPicker();
      return directoryHandle;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  var musicFileExtensions = [
    ".aac",
    ".ac3",
    ".aif",
    ".aiff",
    ".alac",
    ".ape",
    ".au",
    ".flac",
    ".m4a",
    ".m4b",
    ".m4p",
    ".m4r",
    ".mid",
    ".midi",
    ".mp3",
    ".mpa",
    ".mpc",
    ".ogg",
    ".opus",
    ".ra",
    ".ram",
    ".snd",
    ".wav",
    ".wma",
    ".wv",
    ".webm"
    // Add more extensions if needed
  ];
  async function fetchLibraryFiles(directoryHandle) {
    let libraryFileHandles = {};
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file") {
        switch (entry.name) {
          case "library.dat":
            libraryFileHandles.library = entry;
            break;
          case "tandas.dat":
            libraryFileHandles.tandas = entry;
            break;
          case "cortinas.dat":
            libraryFileHandles.cortinas = entry;
            break;
          case "playlists.dat":
            libraryFileHandles.playlists = entry;
            break;
          default:
            break;
        }
      }
    }
    return libraryFileHandles;
  }
  async function getAllFiles(directoryHandle, relativePath = "", fileList = []) {
    try {
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === "file" && relativePath.indexOf("/.AppleDouble") < 0) {
          let extensionBits = entry.name.split(".");
          let extension = extensionBits[extensionBits.length - 1];
          if (musicFileExtensions.includes("." + extension) && !entry.name.startsWith("._")) {
            fileList.push({
              fileHandle: entry,
              relativePath,
              relativeFileName: relativePath + "/" + entry.name
            });
          }
        } else if (entry.kind === "directory") {
          await getAllFiles(entry, `${relativePath}/${entry.name}`, fileList);
        }
      }
      return fileList;
    } catch (error) {
      console.log("Failed to read files");
      eventBus.emit("requestAccessToDisk");
      throw error;
    }
  }
  async function checkDirectoryHandleAccess(directoryHandle) {
    if (!directoryHandle) {
      console.log("No directory handle stored.");
      return false;
    }
    try {
      const entries = directoryHandle.entries();
      for await (const [name, handle] of entries) {
        console.log(`Read access verified for entry: ${name}`);
        break;
      }
      return true;
    } catch (error) {
      console.log("Access verification failed.", error);
      return false;
    }
  }
  async function openMusicFolder(dbManager, config) {
    try {
      const directoryHandleOrUndefined = config.musicFolder;
      if (directoryHandleOrUndefined) {
        console.log(`Retrieved directory handle "${directoryHandleOrUndefined.name}" from IndexedDB.`);
        if (await checkDirectoryHandleAccess(directoryHandleOrUndefined))
          return;
      }
      const directoryHandle = await selectFolder();
      config.musicFolder = directoryHandle;
      await dbManager.updateData("system", CONFIG_ID, config);
      console.log(`Stored directory handle for "${directoryHandle.name}" in IndexedDB.`);
    } catch (error) {
      console.error(error);
      eventBus.emit("requestAccessToDisk");
    }
  }

  // dist/services/permissions.service.js
  async function requestAudioPermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Permission to access audio devices granted.");
    } catch (error) {
      console.error("Error accessing audio devices:", error);
    }
  }
  async function enumerateOutputDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputDevices = devices.filter((device) => device.kind === "audiooutput");
    return outputDevices;
  }

  // dist/services/file-database.interface.js
  async function scanFileSystem(config, dbManager, analyze) {
    try {
      let splitArrayIntoBatches = function(array, batchSize2) {
        const batches2 = [];
        for (let i = 0; i < array.length; i += batchSize2) {
          batches2.push(array.slice(i, i + batchSize2));
        }
        return batches2;
      };
      async function analyzeBatch(fileHandles) {
        let iframe;
        iframe = document.createElement("iframe");
        iframe.src = "ffmpeg-frame.html";
        document.getElementById("iframeContainer").appendChild(iframe);
        await new Promise((resolve) => {
          iframe.addEventListener("load", () => {
            resolve(null);
          });
        });
        let results = await iframe.contentWindow.readMetadataFromFileHandle(fileHandles);
        if (iframe) {
          console.log("Cleaning up FFmpeg resources...");
          iframe.remove();
        }
        return results;
      }
      const scanProgress = getDomElement("#scanProgress");
      const scanFilePath = getDomElement("#scanFilePath");
      scanFilePath.textContent = "Please wait - progress is reported in batches ...";
      scanProgress.textContent = "";
      await dbManager.cacheIndexData();
      let files = await getAllFiles(config.musicFolder);
      let batchSize = 20;
      const batches = splitArrayIntoBatches(files, batchSize);
      let n = 0;
      for (const batch of batches) {
        let analysis;
        if (analyze) {
          analysis = await analyzeBatch(batch.map((item) => item.fileHandle));
        }
        for (let batchIdx = 0; batchIdx < batch.length; batchIdx++) {
          const item = batch[batchIdx];
          let indexFileName = convert(item.relativeFileName);
          scanFilePath.textContent = item.relativeFileName;
          scanProgress.textContent = ++n + "/" + files.length;
          const folderName = indexFileName.split(/\/|\\/g)[1];
          const table = folderName == config.cortinaSubFolder ? "cortina" : folderName == config.musicSubFolder ? "track" : "";
          if (table) {
            let metadata = analysis ? analysis[batchIdx] : {
              start: 0,
              end: -1,
              meanVolume: -20,
              maxVolume: 0,
              tags: { title: indexFileName, artist: "unknown" }
            };
            const newData = {
              type: table,
              name: indexFileName,
              fileHandle: item.fileHandle,
              metadata,
              classifiers: {
                favourite: true
              }
            };
            try {
              let { id } = await dbManager.getDataByName(table, indexFileName);
              if (!id) {
                await dbManager.addData(table, newData);
                dbManager.index(newData);
              } else {
                await dbManager.updateData(table, id, newData);
                dbManager.index(newData);
              }
            } catch (error) {
              await dbManager.addData(table, newData);
              dbManager.index(newData);
            }
          }
        }
      }
      await dbManager.commitChanges();
      console.log("Have now updated the database with all tracks");
    } catch (error) {
      console.error(error);
    }
  }
  async function loadLibraryIntoDB(config, dbManager) {
    const scanProgress = getDomElement("#scanProgress");
    const scanFilePath = getDomElement("#scanFilePath");
    const libraryFileHandles = await fetchLibraryFiles(config.musicFolder);
    async function getJSON(file) {
      const text = await file.text();
      const json = JSON.parse(text);
      return json;
    }
    async function setTrackDetails(library, table) {
      let n = 0;
      let files = await getAllFiles(config.musicFolder);
      for (const file of files) {
        scanFilePath.textContent = file.relativeFileName;
        scanProgress.textContent = ++n + "/" + files.length;
        let tn = convert(file.relativeFileName);
        const libTrack = library[tn.substring(1)];
        if (libTrack) {
          const newData = {
            type: table,
            name: tn,
            fileHandle: file.fileHandle,
            metadata: {
              tags: {
                title: libTrack.track.title,
                artist: libTrack.track.artist,
                notes: libTrack.classifiers?.notes,
                year: libTrack.track.date,
                bpm: libTrack.classifiers?.bpm
              },
              start: libTrack.analysis.start,
              end: libTrack.analysis.silence,
              style: libTrack.classifiers?.style,
              meanVolume: libTrack.analysis.meanGain || -20,
              maxVolume: libTrack.analysis.gain || 0
            },
            classifiers: {
              favourite: true
            }
          };
          await dbManager.addData(table, newData);
        } else {
          console.log("Not found in library", tn.substring(1));
        }
      }
    }
    if (libraryFileHandles) {
      let library;
      let cortinas;
      let tandas;
      let playlists;
      console.log(libraryFileHandles);
      if (libraryFileHandles.library) {
        library = await getJSON(await libraryFileHandles.library.getFile());
        console.log(library);
        await dbManager.clearAllData("track");
        await setTrackDetails(library, "track");
      }
      if (libraryFileHandles.cortinas) {
        cortinas = await getJSON(await libraryFileHandles.cortinas.getFile());
        console.log("cortinas", cortinas);
        await dbManager.clearAllData("cortina");
        await setTrackDetails(cortinas, "cortina");
      }
      if (libraryFileHandles.tandas) {
        tandas = await getJSON(await libraryFileHandles.tandas.getFile());
        console.log("tandas", tandas);
        for (let tanda of tandas) {
          tanda.tracks = tanda.tracks.map((track) => "/" + track);
          if (tanda.cortina && tanda.cortina[0]) {
            tanda.cortina = tanda.cortina.map((cortina) => "/" + cortina.track)[0];
          } else {
            tanda.cortina = void 0;
          }
          try {
            const existing = await dbManager.getDataById("tanda", tanda.id);
            if (!existing) {
              await dbManager.addData("tanda", tanda);
            } else {
              await dbManager.updateData("tanda", tanda.id, tanda);
            }
          } catch (error) {
            delete tanda.id;
            await dbManager.addData("tanda", tanda);
          }
        }
      }
      if (libraryFileHandles.playlists) {
        const originalPlaylists = await getJSON(await libraryFileHandles.playlists.getFile());
        console.log("playlists", originalPlaylists);
        for (let playlist of originalPlaylists) {
          console.log(playlist);
          for (let tanda of playlist.tandas) {
            tanda.tracks = tanda.tracks.map((track) => "/" + track);
            if (tanda.cortina && tanda.cortina[0]) {
              tanda.cortina = tanda.cortina.map((cortina) => "/" + cortina.track)[0];
            } else {
              tanda.cortina = void 0;
            }
          }
          let newPlaylist = {
            id: playlist.id,
            type: "playlist",
            name: playlist.name,
            lastPlayed: "",
            created: playlist.createdDate,
            pattern: playlist.pattern,
            trackSpacing: playlist.trackSpacing,
            preCortinaSpacing: playlist.preCortinaSpacing,
            postCortinaSpacing: playlist.postCortinaSpacing,
            cortinaFolder: playlist.useCortina,
            startTime: playlist.start,
            endTime: playlist.endTime,
            tandas: playlist.tandas
          };
          try {
            const existing = await dbManager.getDataByName("playlist", newPlaylist.name);
            if (!existing || !newPlaylist.id) {
              await dbManager.addData("playlist", newPlaylist);
            } else {
              await dbManager.updateData("playlist", newPlaylist.id, newPlaylist);
            }
          } catch (error) {
            delete newPlaylist.id;
            await dbManager.addData("playlist", newPlaylist);
          }
        }
      }
    }
  }

  // dist/services/cortina-service.js
  var CortinaPicker = class {
    dbManager;
    cortinaWindow = document.querySelector("#cortinaPicker");
    cortinaList = document.querySelector("#cortinaList");
    folderSelect = document.querySelector("#folderSelect");
    cortinas = [];
    folders;
    lastSelection;
    targetTanda;
    constructor(dbManager) {
      this.dbManager = dbManager;
      this.lastSelection = this.loadPreviousSelection();
      this.cortinaList.addEventListener("click", (event) => {
        console.log("selected cortina", event.target);
        this.cortinaWindow?.classList.add("hidden");
        const tanda = this.targetTanda;
        const cortina = tanda.querySelector("cortina-element");
        if (cortina) {
          tanda.replaceChild(event.target.cloneNode(true), cortina);
          tanda.render();
          eventBus.emit("changed-playlist");
        }
      });
      document.addEventListener("changeCortina", (event) => {
        console.log("Request to change cortina", event.detail);
        this.targetTanda = event.detail;
        const current = this.targetTanda?.querySelector("cortina-element");
        if (!current) {
          this.targetTanda.innerHTML = createPlaceHolder("cortina-element", "cortina") + this.targetTanda.innerHTML;
        }
        this.cortinaWindow?.classList.remove("hidden");
        this.chooseCortina();
      });
      this.folderSelect.addEventListener("change", () => {
        const selectedFolder = this.folderSelect.value;
        this.lastSelection = selectedFolder;
        this.saveSelection(selectedFolder);
        this.renderList();
      });
      this.renderList();
    }
    loadPreviousSelection() {
      return localStorage.getItem("selectedFolder");
    }
    saveSelection(folder) {
      localStorage.setItem("selectedFolder", folder);
    }
    renderList() {
      const cortinas = this.folders?.get(this.lastSelection) || [];
      this.cortinaList.innerHTML = "";
      let html = "";
      cortinas.forEach((cortina, index) => {
        html += renderTrackDetail(index, cortina, "cortina");
      });
      this.cortinaList.innerHTML = html;
    }
    async load() {
      this.cortinas = await this.dbManager.processEntriesInBatches("cortina", (cortina) => {
        return true;
      });
      this.folders = this.parseFolders(this.cortinas);
      this.folderSelect.innerHTML = "";
      this.folderSelect.appendChild(new Option("Select a folder", ""));
      this.folders.forEach((_, folder) => {
        this.folderSelect.appendChild(new Option(folder, folder));
      });
    }
    parseFolders(cortinas) {
      const folderMap = /* @__PURE__ */ new Map();
      cortinas.forEach((cortina) => {
        const path = cortina.name;
        const folder = path.split("/").slice(2, path.split("/").length - 1).join("-");
        if (!folderMap.has(folder)) {
          folderMap.set(folder, []);
        }
        folderMap.get(folder)?.push(cortina);
      });
      return folderMap;
    }
    async chooseCortina() {
    }
  };

  // dist/app.js
  var CONFIG_ID2 = 1;
  var musicFolder;
  async function getConfigPreferences(dbManager) {
    const options = {};
    const form = getDomElement("#settingsPanel");
    const inputs = Array.from(form.querySelectorAll("input, select, #folderPath"));
    for (const input of inputs) {
      const id = input.id;
      const value = (() => {
        switch (input.type) {
          case "checkbox":
            return input.checked;
          case "text":
            return input.value;
          case "number":
            return input.value;
          default:
            return input.textContent;
        }
      })();
      console.log(id, value, input);
      options[id] = value;
    }
    options.musicFolder = musicFolder;
    await dbManager.updateData("system", CONFIG_ID2, options).catch(async (error) => {
      await dbManager.addData("system", options);
    });
    return options;
  }
  function setConfigPreferences(options) {
    musicFolder = options.musicFolder;
    const form = getDomElement("#settingsPanel");
    const inputs = Array.from(form.querySelectorAll("input, select, #folderPath"));
    for (const input of inputs) {
      const id = input.id;
      if (input.type == "checkbox") {
        input.checked = options[id];
      } else if (input.type == "text") {
        input.value = options[id];
      } else {
        input.textContent = options[id];
      }
    }
  }
  async function InitialiseConfig(dbManager) {
    try {
      const config = await dbManager.getDataById("system", CONFIG_ID2);
      if (!config) {
        let newConfig = await getConfigPreferences(dbManager);
        newConfig.source = "Initialisation";
        await dbManager.addData("system", newConfig);
      }
    } catch (error) {
      console.error("Database operation failed", error);
    }
    return await dbManager.getDataById("system", CONFIG_ID2);
  }
  async function getSystemLevel(dbManager) {
    let systemLowestGain = { meanVolume: -20, maxVolume: 0 };
    await dbManager.processEntriesInBatches("track", (record) => {
      let trackLevel = record.metadata.meanVolume - record.metadata.maxVolume;
      let systemLevel = systemLowestGain.meanVolume - systemLowestGain.maxVolume;
      if (trackLevel < systemLevel)
        systemLowestGain = record.metadata;
      let extension = record.name.split(".");
      extension = extension[extension.length - 1];
      return true;
    });
    return systemLowestGain;
  }
  async function deleteDatabase(dbManager) {
    await dbManager.resetDatabase();
    return await getConfigPreferences(dbManager);
  }
  async function processQuery(dbManager, query, selectedStyle) {
    console.log("Search", query, selectedStyle);
    let testResult = await dbManager.search(query);
    console.log("Raw results", testResult);
    if (testResult.length == 0) {
      return { queryNo: 0, tracks: [], tandas: [] };
    }
    let tracks = await dbManager.processEntriesInBatches("track", (track, idx) => true);
    let trackMap = /* @__PURE__ */ new Map();
    tracks.forEach((track) => {
      trackMap.set(convert(track.name).toLowerCase(), track);
    });
    let maxScore = 0;
    testResult.forEach((result) => {
      maxScore = maxScore < result.score ? result.score : maxScore;
    });
    let minScore = maxScore * 0.6;
    console.log("Min/Max", minScore, maxScore);
    let trackResults = [];
    testResult.forEach((result) => {
      if (result.score >= minScore) {
        let prefix = result.id.split("-");
        let key = convert(result.id.substring([prefix[0], prefix[1]].join("-").length + 1)).toLowerCase();
        let track = trackMap.get(key);
        if (track) {
          if (selectedStyle == "all" || track.metadata?.style?.toLowerCase() == selectedStyle) {
            console.log("Match", result);
            trackResults.push(track);
          }
        }
      }
    });
    let tandaResults = /* @__PURE__ */ new Set();
    let allTandas = await dbManager.processEntriesInBatches("tanda", (tanda) => {
      return true;
    });
    let tandaMap = /* @__PURE__ */ new Map();
    allTandas.forEach((tanda) => {
      tanda.tracks.forEach((track) => {
        let key = convert(track).toLowerCase();
        if (!tandaMap.has(key)) {
          tandaMap.set(key, [tanda]);
        } else {
          let list = tandaMap.get(key);
          list.push(tanda);
        }
      });
    });
    trackResults.forEach((track) => {
      let key = convert(track.name).toLowerCase();
      if (tandaMap.has(key)) {
        [...tandaMap.get(key)].map((item) => tandaResults.add(item));
      }
    });
    return {
      queryNo: 0,
      tracks: trackResults.filter((x) => x),
      tandas: [...tandaResults]
    };
  }
  async function populateOutputDeviceOptions(config) {
    const outputDevices = await enumerateOutputDevices();
    function fillOptions(current, target) {
      target.innerHTML = "";
      outputDevices.forEach((device) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.text = device.label || "Unknown Device";
        option.selected = current == device.deviceId;
        target.appendChild(option);
      });
    }
    fillOptions(config.mainOutput, getDomElement("#speaker-output-devices"));
    fillOptions(config.headphoneOutput, getDomElement("#headphones-output-devices"));
  }
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      alert(`Without access to your computer's audio, Tanda Player cannot operate`);
      throw error;
    }
    eventBus.on("error", (error) => {
      alert(error);
    });
    const dbManager = await DatabaseManager();
    let config = await InitialiseConfig(dbManager);
    setConfigPreferences(config);
    const cortinaPicker = new CortinaPicker(dbManager);
    await cortinaPicker.load();
    config = await getConfigPreferences(dbManager);
    console.log("DEBUG CONFIG", config);
    await dbManager.cacheIndexData();
    let quickClickHandlers = {
      folderPicker: async () => {
        try {
          if (!window.showDirectoryPicker) {
            alert("Your browser does not support the File System Access API");
            return;
          }
          const directoryHandle = await window.showDirectoryPicker();
          musicFolder = directoryHandle;
          const folderPathElement = document.getElementById("folderPath");
          folderPathElement.textContent = directoryHandle.name;
          folderPathElement.dataset.path = directoryHandle.name;
        } catch (error) {
          console.error("Error selecting folder:", error);
        }
      },
      askUserPermission: async () => {
        await openMusicFolder(dbManager, config).then(() => {
          const modal = getDomElement("#permissionModal");
          modal.classList.add("hidden");
          eventBus.emit("UserGrantedPermission");
        }).catch((error) => {
          alert(error);
        });
      },
      rescanButton: async () => {
        config = await getConfigPreferences(dbManager);
        await scanFileSystem(config, dbManager, false);
        await cortinaPicker.load();
      },
      rescanAnalyzeButton: async () => {
        config = await getConfigPreferences(dbManager);
        await scanFileSystem(config, dbManager, true);
        await cortinaPicker.load();
      },
      settingsPanelButton: () => {
        getDomElement("#settingsPanel").classList.remove("hiddenPanel");
      },
      settingsPanelButtonClose: async () => {
        getDomElement("#settingsPanel").classList.add("hiddenPanel");
        config = await getConfigPreferences(dbManager);
      },
      playlistSettingsPanelOpenButton: async () => {
        let config2 = await getConfigPreferences(dbManager);
        let playlistFields = document.querySelectorAll("#settingsContainer input");
        for (let field of playlistFields) {
          if (!field.value) {
            let id = field.id.toLowerCase();
            let defaultId = "default" + id;
            Object.keys(config2).forEach((key) => {
              console.log("Checking setting", id, defaultId, key, config2[key]);
              if (key.toLowerCase() == defaultId) {
                field.value = config2[key];
              }
            });
          }
        }
        getDomElement(".playlist-settings-panel").classList.remove("hiddenPanel");
      },
      playlistSettingsPanelCloseButton: () => {
        getDomElement(".playlist-settings-panel").classList.add("hiddenPanel");
      },
      deleteDBButton: async () => {
        config = await deleteDatabase(dbManager);
      },
      loadLibraryButton: async () => {
        config = await getConfigPreferences(dbManager);
        await loadLibraryIntoDB(config, dbManager);
        await cortinaPicker.load();
      },
      refreshAudioLists: () => {
        populateOutputDeviceOptions(config);
      },
      stopButton: () => {
        eventBus.emit("stopPlaying");
      },
      playAll: () => {
        getDomElement("#playAll").classList.remove("active");
        eventBus.emit("playAll");
      },
      stopPlayAll: () => {
        eventBus.emit("stopAll");
      },
      cortinaPickerButtonClose: () => {
        getDomElement("#cortinaPicker").classList.add("hidden");
      },
      createTandaButton: () => {
        const scratchPad = getDomElement("#scratchPad");
        let tab = scratchPad.getActiveTabContents();
        if (tab) {
          const newTanda = document.createElement("tanda-element");
          newTanda.dataset.style = "undefined";
          tab.appendChild(newTanda);
        }
      },
      collapsePlaylist: () => {
        const allTandas = Array.from(document.querySelectorAll("tanda-element"));
        allTandas.forEach((tanda) => {
          tanda.collapse();
        });
      },
      extendPlaylist: () => {
        const container = getDomElement("#playlistContainer");
        const sequence = getDomElement("#tandaStyleSequence").value?.toUpperCase();
        console.log(`Sequence used: ${sequence}`);
        const styleMap = {
          T: "Tango",
          W: "Waltz",
          M: "Milonga"
        };
        for (let t of sequence.split(" ")) {
          let n = parseInt(t);
          let s = t.substring(String(n).length);
          console.log(t, "N", n, "S", s);
          let tanda = document.createElement("tanda-element");
          tanda.dataset.style = styleMap[s];
          tanda.dataset.size = String(n);
          let html = "";
          let needCortina = true;
          if (needCortina) {
            html += createPlaceHolder("cortina-element", "cortina");
          }
          for (let i = 0; i < n; i++) {
            html += createPlaceHolder("track-element", styleMap[s]);
          }
          tanda.innerHTML = html;
          container.appendChild(tanda);
        }
      }
    };
    for (const key of Object.keys(quickClickHandlers)) {
      getDomElement((!key.startsWith(".") ? "#" : "") + key).addEventListener("click", quickClickHandlers[key]);
    }
    Array.from(document.querySelectorAll("button")).forEach((button) => {
      button.addEventListener("mousedown", () => {
        button.style.backgroundColor = "var(--button-clicked)";
      });
      button.addEventListener("mouseup", () => {
        button.style.backgroundColor = "var(--button-background)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.backgroundColor = "var(--button-background)";
      });
    });
    await new Promise((resolve) => {
      eventBus.once("UserGrantedPermission", resolve);
    });
    const configPanel = getDomElement("#settingsPanel");
    configPanel.addEventListener("change", async () => {
      config = await getConfigPreferences(dbManager);
      eventBus.emit("config-change");
    });
    eventBus.on("changeTrackData", async (payload) => {
      console.log("Changed text values", payload);
      const track = await dbManager.getDataById(payload.type, parseInt(payload.trackId));
      if (track?.id) {
        let x = new Function("track", payload.field + ' = "' + payload.value.replace('"', '"') + '"')(track);
        console.log("Old value:", x, "New value:", track);
        await dbManager.updateData(payload.type, track.id, track);
      }
    });
    const tabs = ["Search", "Favourites", "Recent", "Non-overlapping"];
    const tabsContainer = new SearchTabsContainer(getDomElement("#tabsContainer"), tabs, dbManager);
    eventBus.on("query", async (payload) => {
      const results = await processQuery(dbManager, payload.searchData, payload.selectedStyle);
      eventBus.emit("queryResults", {
        ...results,
        search: payload.search,
        queryNo: payload.queryNo
      });
    });
    await requestAudioPermission();
    populateOutputDeviceOptions(config);
    const outputDeviceSelector = getDomElement("#speaker-output-devices");
    outputDeviceSelector.addEventListener("change", () => {
      const selectedDeviceId = outputDeviceSelector.value;
      config.mainOutput = selectedDeviceId;
      dbManager.updateData("system", 1, config);
      eventBus.emit("change-speaker", selectedDeviceId);
    });
    const headphoneDeviceSelector = getDomElement("#headphones-output-devices");
    headphoneDeviceSelector.addEventListener("change", () => {
      const selectedDeviceId = headphoneDeviceSelector.value;
      config.headphoneOutput = selectedDeviceId;
      dbManager.updateData("system", 1, config);
      eventBus.emit("change-headphones", selectedDeviceId);
    });
    await runApplication(dbManager, config);
  });
  async function runApplication(dbManager, config) {
    let systemLowestGain = await getSystemLevel(dbManager);
    let fadeRate = 3;
    const playlistContainer = getDomElement("#playlistContainer");
    const playlistService = new PlaylistService(playlistContainer, async (type, name) => {
      return await dbManager.getDataByName(type, name);
    });
    scheduleEventEvery(1, () => {
      const tandas = Array.from(playlistContainer.querySelectorAll("tanda-element"));
      const playingTanda = playlistContainer.querySelector("tanda-element.playing");
      if (!playingTanda) {
        tandas.forEach((tanda) => {
          tanda.scheduledPlayingTime("");
        });
      }
      let startTime = /* @__PURE__ */ new Date();
      const timings = {
        preCortina: 3,
        postCortina: 3,
        interTrack: 2
      };
      let donePlayingTanda = false;
      let foundPlayingTrack = false;
      tandas.forEach((tanda) => {
        donePlayingTanda ||= tanda == playingTanda;
        if (donePlayingTanda) {
          let extra = "";
          if (tanda == playingTanda) {
            let allTracks2 = Array.from(tanda.querySelectorAll("track-element"));
            if (allTracks2) {
              let playing = tanda.querySelector("track-element.playing");
              if (playing) {
                extra = ` ${String(allTracks2.indexOf(playing) + 1)}/${String(allTracks2.length)}`;
              }
            }
          }
          tanda.scheduledPlayingTime(startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          }) + extra);
          const hasCortina = tanda.querySelector("cortina-element");
          const tracks = Array.from(tanda.querySelectorAll("track-element"));
          let duration = 0;
          if (hasCortina) {
            duration += timings.preCortina + timings.postCortina;
          } else {
            duration += timings.interTrack;
          }
          duration += tracks.length * timings.interTrack;
          duration += tracks.reduce((total, track) => {
            foundPlayingTrack ||= track.classList.contains("playing") || hasCortina?.classList.contains("playing") || false;
            if (foundPlayingTrack) {
              const duration2 = timeStringToSeconds(track.dataset.duration || "0:0");
              return total + (typeof duration2 == "number" ? duration2 : 0);
            } else {
              return total;
            }
          }, 0);
          startTime.setSeconds(startTime.getSeconds() + duration);
        } else {
          tanda.scheduledPlayingTime("");
        }
      });
    });
    playlistContainer.addEventListener("clickedTrack", async (event) => {
      try {
        const track = event.detail;
        const playing = document.querySelector("track-element.playing, cortina-element.playing");
        if (!playing) {
          let N = playlistService.getN(track);
          await speakerOutputPlayer.updatePosition(N - 1);
          if (speakerOutputPlayer.next) {
            speakerOutputPlayer.next.silence = 0;
          }
          speakerOutputPlayer.startNext();
          getDomElement("#stopButton").classList.add("active");
        }
      } catch (error) {
        console.error(error);
        alert(error);
      }
    });
    const headerField = getDomElement("body > header > h1");
    const stopButton = getDomElement("#stopButton");
    const speakerPlayerConfig = {
      ctx: config.mainOutput,
      systemLowestGain,
      fadeRate,
      useSoundLevelling: config.useSoundLevelling,
      fetchNext: async (N) => {
        let allTracks2 = playlistService.allTracks;
        let silence = 0;
        let nextTrack = void 0;
        while (!nextTrack && N < allTracks2.length) {
          console.log("Getting next track", N);
          nextTrack = await playlistService.fetch(N);
          if (!nextTrack)
            N++;
        }
        if (!nextTrack) {
          return { N, track: void 0, silence: 0 };
        }
        if (N > 0) {
          let pN = N;
          let previousTrack = void 0;
          while (!previousTrack && pN > 1) {
            previousTrack = await playlistService.fetch(pN - 1);
            if (!previousTrack)
              pN--;
          }
          silence = 2;
          if (previousTrack) {
            if (nextTrack.type == "track" && previousTrack.type == "cortina") {
              silence = 4;
            }
            if (nextTrack.type == "cortina" && previousTrack.type == "track") {
              silence = 4;
            }
          }
        }
        return { track: nextTrack, silence };
      },
      progress: (data) => {
        if (data.state === "Playing") {
          stopButton.classList.add("active");
          if (data.track.type == "cortina") {
            playlistService.playingCortina(true);
          } else {
            playlistService.playingCortina(false);
          }
        } else {
          stopButton.classList.remove("active");
          playlistService.playingCortina(false);
        }
        headerField.textContent = data.display;
      },
      notify: eventBus.emit.bind(eventBus)
    };
    let headphonePlaylist = [];
    const headphonesPlayerConfig = {
      ctx: config.headphoneOutput,
      systemLowestGain,
      fadeRate: 0.5,
      useSoundLevelling: config.useSoundLevelling,
      fetchNext: async (N) => {
        if (N == 0) {
          return { track: headphonePlaylist[0], silence: 0 };
        } else {
          return { track: void 0, silence: 0 };
        }
      }
    };
    const speakerOutputPlayer = new Player(speakerPlayerConfig);
    const headphonesOutputPlayer = new Player(headphonesPlayerConfig);
    eventBus.on("change-speaker", (context) => {
      speakerPlayerConfig.ctx = context;
      speakerOutputPlayer.updateOptions(speakerPlayerConfig);
    });
    eventBus.on("change-headphones", (context) => {
      headphonesPlayerConfig.ctx = context;
      headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
    });
    eventBus.on("config-change", () => {
      speakerPlayerConfig.useSoundLevelling = config.useSoundLevelling;
      speakerOutputPlayer.updateOptions(speakerPlayerConfig);
      headphonesPlayerConfig.useSoundLevelling = config.useSoundLevelling;
      headphonesOutputPlayer.updateOptions(headphonesPlayerConfig);
    });
    eventBus.on("playAll", () => {
      speakerOutputPlayer.extendEndTime(-1);
    });
    eventBus.on("stopAll", () => {
      speakerOutputPlayer.stop();
      speakerOutputPlayer.startNext();
    });
    eventBus.on("stopPlaying", () => {
      speakerOutputPlayer.stop();
      playlistService.allTracks.forEach((track) => track.setPlaying(false));
      let tandas = Array.from(playlistContainer.querySelectorAll("tanda-element"));
      tandas.forEach((tanda) => {
        tanda.setPlaying(false);
      });
    });
    eventBus.on("playOnHeadphones", async (detail) => {
      const track = detail.element;
      allTracks(document).forEach((x) => {
        if (x !== track)
          x.stopPlayingOnHeadphones();
      });
      if (!detail.playing) {
        headphonesOutputPlayer.stop();
      } else {
        const table = track.dataset.type;
        headphonePlaylist[0] = await dbManager.getDataById(table, parseInt(track.dataset.trackId));
        headphonesOutputPlayer.stop();
        await headphonesOutputPlayer.updatePosition(-1);
        headphonesOutputPlayer.startNext();
        headphonePlaylist = [];
      }
    });
    eventBus.on("changed-playlist", async () => {
      const N = playlistService.getNowPlayingN();
      console.log("Changed playlist - now playing", N, speakerOutputPlayer);
      await speakerOutputPlayer.updatePosition(N);
    });
    const playlistPicker = getDomElement("#playlistPicker");
    const playlists = await dbManager.processEntriesInBatches("playlist", (record) => true);
    for (const playlist of playlists) {
      const option = document.createElement("option");
      option.value = playlist.name;
      option.textContent = playlist.name;
      playlistPicker.appendChild(option);
    }
    playlistPicker.addEventListener("change", async () => {
      const chosenPlaylist = playlistPicker.value;
      const tandas = (await dbManager.getDataByName("playlist", chosenPlaylist)).tandas;
      playlistService.setTandas(tandas);
    });
  }
})();
/*! howler.js v2.2.4 | (c) 2013-2020, James Simpson of GoldFire Studios | MIT License | howlerjs.com */
/*! Spatial Plugin */

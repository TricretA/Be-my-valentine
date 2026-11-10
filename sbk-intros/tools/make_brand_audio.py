# SBK MEDIA TV channel-intro sound design + per-frame spectrum for the audio-reactive visuals.
# Run: python3 tools/make_brand_audio.py   (writes public/audio/sbk-intro.wav + public/data/spectrum.json)
import sys, os, json, wave
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import make_audio as M
from make_audio import *   # synth voices

FPS = 60
b = buf()
# --- bed: warm low pad that swells, bass root under the impact, lift pad for the lockup
put(b, pad([55, 110, 164.8, 220], 10, 0.5, att=2.6, rel=1.2), 0)
put(b, bass(55, 2.8, 0.55), 2.45); put(b, pad([110, 164.8, 220, 277.2], 6.0, 0.28, att=0.8, rel=1.4), 2.45)
put(b, pad([220, 277.2, 329.6, 415.3, 554.4], 4.2, 0.22, att=1.4, rel=1.2), 5.4)

# --- act 1: waveform alive (0 -> 2.0): accelerating heartbeat + sparkle plucks + riser
for s in (0.25, 0.8, 1.3, 1.7, 1.98): put(b, kick(0.42), s)
notes = [880, 1046.5, 1318.5, 1568, 1174.7, 987.8]
rs = np.random.default_rng(11)
for i, s in enumerate(np.linspace(0.35, 1.95, 13)):
    put(b, pluck(notes[i % len(notes)], 1.2, 0.16), float(s), float(rs.uniform(-.7, .7)))
put(b, riser(2.15, 0.5), 0.3)
put(b, whoosh(0.9, 0.4), 1.25)                    # bars rush inwards

# --- act 2: S halves slam in (2.0 / 2.1) and lock (2.45)
put(b, whoosh(0.55, 0.55), 1.95, -0.6); put(b, whoosh(0.55, 0.55), 2.03, 0.6)
t_imp = 2.45
put(b, sub_hit(1.0, 2.6), t_imp); put(b, kick(0.95), t_imp)
put(b, gong(220, 7.0, 0.8), t_imp); put(b, bell(880, 4, 0.32), t_imp, 0.2)
put(b, clap(0.55), t_imp)
crash = norm(hp(rng.standard_normal(int(SR * 1.8)), 1)) * np.exp(-tt(1.8) * 2.4)
put(b, crash, t_imp, 0.0, 0.45)
for i, (f, s) in enumerate(((1760, 2.5), (2217, 2.6), (2637, 2.7), (3520, 2.8))):   # shimmer
    put(b, bell(f, 2.4, 0.1), s, -0.5 + i * .35)

# --- act 3: grille bars click into the mic
put(b, pluck(1318.5, 1.4, 0.35), 2.95, -0.2); put(b, pluck(1760, 1.4, 0.35), 3.1, 0.2)
put(b, tick(0.6), 2.95); put(b, tick(0.6), 3.1)

# --- act 4: lockup move, slab wipe, wordmark
put(b, riser(0.9, 0.35), 3.55)
put(b, whoosh(0.7, 0.55), 3.95)
put(b, snare(0.6), 4.3); put(b, sub_hit(0.55, 1.4), 4.3); put(b, kick(0.7), 4.3)
put(b, whoosh(0.5, 0.35), 4.45, 0.5)
for i in range(9): put(b, tick(0.35), 4.62 + i * 0.045, -0.3 + i * 0.075)

# --- act 5: programme names
for s, f in ((5.3, 659.25), (5.72, 783.99), (6.14, 987.77)):
    put(b, pluck(f, 1.8, 0.4), s, 0.0); put(b, bell(f * 2, 2.2, 0.14), s); put(b, kick(0.3), s)

# --- act 6: hold & chime-out
put(b, riser(1.2, 0.25), 7.0)
put(b, bell(440, 4, 0.34), 8.4); put(b, bell(880, 3.5, 0.2), 8.4, 0.3); put(b, sub_hit(0.5, 1.5), 8.4)
for i, f in enumerate((1318.5, 1760, 2217, 2637)): put(b, bell(f, 2.0, 0.09), 8.5 + i * 0.1, -0.4 + i * .3)

M.finish(b, "sbk-intro", wet=0.3, fade=0.5, peak=0.89)

# --- spectrum analysis (48 log bands, 60fps) for audio-reactive bars
with wave.open("public/audio/sbk-intro.wav") as w:
    raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32) / 32768
mono = raw.mean(axis=1)
NB, N_FFT = 48, 4096
edges = np.geomspace(60, 12000, NB + 1)
freqs = np.fft.rfftfreq(N_FFT, 1 / SR)
win = np.hanning(N_FFT)
frames = []
for fr in range(int(10 * FPS)):
    c = int((fr + 0.5) / FPS * SR)
    seg = mono[max(0, c - N_FFT // 2): c + N_FFT // 2]
    seg = np.pad(seg, (0, N_FFT - len(seg)))
    mag = np.abs(np.fft.rfft(seg * win))
    row = []
    for i in range(NB):
        sel = (freqs >= edges[i]) & (freqs < edges[i + 1])
        row.append(mag[sel].max() if sel.any() else 0.0)
    frames.append(row)
S = np.array(frames)
S = 20 * np.log10(S + 1e-5)
lo = np.percentile(S, 8, axis=0); hi = np.percentile(S, 99, axis=0)      # per-band range -> every band 'moves'
S = np.clip((S - lo) / np.maximum(hi - lo, 1e-6), 0, 1) ** 1.6
# temporal smoothing: fast attack, slower release (feels like a real analyser)
out = np.zeros_like(S); out[0] = S[0]
for i in range(1, len(S)): out[i] = np.maximum(S[i], out[i - 1] * 0.86)
# overall loudness curve for glows / camera
rms = np.array([np.sqrt((mono[int(fr / FPS * SR): int((fr + 1) / FPS * SR)] ** 2).mean()) for fr in range(600)])
rms = rms / rms.max()
os.makedirs("public/data", exist_ok=True)
json.dump({"fps": FPS, "bands": NB, "spec": np.round(out, 3).tolist(), "level": np.round(rms, 3).tolist()}, open("public/data/spectrum.json", "w"))
print("spectrum", out.shape, "ok")

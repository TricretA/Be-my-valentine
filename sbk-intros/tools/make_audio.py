# Original (royalty-free) sound design for the three SBK intros. 10s, 44.1k stereo.
# Run: python3 -I tools/make_audio.py
import numpy as np, wave
SR = 44100
DUR = 10.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def buf(): return np.zeros((N, 2))
def put(b, sig, at, pan=0.0, gain=1.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4)
    r = gain * np.sin((pan + 1) * np.pi / 4)
    b[i:i + len(sig), 0] += sig * l
    b[i:i + len(sig), 1] += sig * r

def tt(d): return np.arange(int(SR * d)) / SR
def hp(x, k=1):
    for _ in range(k): x = np.concatenate([[0], np.diff(x)])
    return x
def lp(x, a):
    y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def norm(x): m = np.abs(x).max(); return x / m if m else x

def kick(g=1):
    t = tt(0.45); f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return g * np.sin(ph) * np.exp(-t * 7) * np.minimum(1, t * 800)
def snare(g=1):
    t = tt(0.3); n = norm(hp(rng.standard_normal(len(t)))) * np.exp(-t * 20)
    return g * (0.8 * n + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25))
def hat(g=1, d=0.06):
    t = tt(d); return g * norm(hp(rng.standard_normal(len(t)), 2)) * np.exp(-t * 90)
def clap(g=1):
    out = np.zeros(int(SR * 0.3))
    for o in (0, 0.012, 0.024):
        n = norm(hp(rng.standard_normal(int(SR * 0.2)))) * np.exp(-tt(0.2) * 30)
        i = int(o * SR); out[i:i + len(n)] += n
    return g * out
def bell(f, d=4.0, g=1.0):
    t = tt(d); out = np.zeros_like(t)
    for r, a, dc in ((1, 1, 1.1), (2.01, .6, 1.6), (2.76, .5, 2.1), (4.07, .3, 3), (5.4, .25, 3.5), (8.93, .12, 5)):
        out += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dc * 1.1)
    return g * norm(out) * np.minimum(1, t * 300)
def gong(f, d=6.0, g=1.0):
    t = tt(d); out = np.zeros_like(t)
    for r, a in ((1, 1), (1.47, .7), (1.98, .6), (2.52, .5), (3.1, .35), (4.3, .2)):
        out += a * np.sin(2 * np.pi * f * r * t + 2 * np.sin(2 * np.pi * 3.1 * t) * .15) * np.exp(-t * (0.5 + r * 0.35))
    return g * norm(out) * np.minimum(1, t * 120)
def pad(freqs, d, g=1.0, att=2.0, rel=1.5):
    t = tt(d); out = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0, 0.004):
            out += np.sin(2 * np.pi * f * (1 + det) * t) + 0.35 * np.sin(2 * np.pi * 2 * f * (1 + det) * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    env = np.minimum(1, t / att) * np.minimum(1, (d - t) / rel)
    return g * norm(out) * env
def pluck(f, d=1.6, g=1.0):
    t = tt(d); s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8) + 0.15 * np.sin(2 * np.pi * 4.1 * f * t) * np.exp(-t * 20)
    return g * s * np.exp(-t * 3.2) * np.minimum(1, t * 400)
def bass(f, d=0.4, g=1.0):
    t = tt(d); s = np.sin(2 * np.pi * f * t); s = np.tanh(2.2 * s) 
    return g * s * np.exp(-t * 4) * np.minimum(1, t * 500)
def riser(d, g=1.0):
    t = tt(d); n = hp(rng.standard_normal(len(t)), 1)
    n = norm(n) * (t / d) ** 2.2
    f = 180 * (12 ** (t / d)); sw = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2.5
    return g * (0.7 * n + 0.4 * sw)
def whoosh(d=0.9, g=1.0):
    t = tt(d); n = norm(hp(rng.standard_normal(len(t)), 1))
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return g * n * env
def sub_hit(g=1.0, d=2.0):
    t = tt(d); f = 36 + 80 * np.exp(-t * 14)
    return g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4) * np.minimum(1, t * 600)
def tick(g=1.0):
    t = tt(0.05); return g * np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 140)

def reverb(x, wet=0.25, secs=2.4):
    n = int(SR * secs); t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in (0, 1):
        ir = rng.standard_normal(n) * np.exp(-t * 3.0); ir[:int(.012 * SR)] = 0
        ir = lp(ir, 0.35)
        L = len(x) + n
        y = np.fft.irfft(np.fft.rfft(x[:, ch], L) * np.fft.rfft(ir, L), L)[:len(x)]
        out[:, ch] = y / (np.abs(y).max() + 1e-9) * np.abs(x[:, ch]).max()
    return x * (1 - wet * 0.5) + out * wet

def finish(b, name, wet=0.25, fade=0.5, peak=0.89):
    b = reverb(b, wet)
    g = np.ones(N); k = int(fade * SR); g[-k:] = np.linspace(1, 0, k) ** 1.5
    b *= g[:, None]
    b = np.tanh(b * 1.05)
    b = b / np.abs(b).max() * peak
    pcm = (b * 32767).astype(np.int16)
    with wave.open(f"public/audio/{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(name, "ok")

# ---------------------------------------------------------------- WISDOM (D minor, slow, cinematic)
def wisdom():
    b = buf()
    put(b, pad([73.4, 110, 146.8, 174.6, 220], 10, 0.55, att=3.0, rel=1.8), 0)
    put(b, pad([293.7, 349.2, 440], 6.8, 0.18, att=2.5, rel=1.8), 3.1)       # lift on title
    put(b, riser(2.9, 0.45), 0.3)
    put(b, whoosh(0.6, 0.35), 2.75)
    put(b, sub_hit(1.0), 3.2); put(b, gong(146.8, 7, 0.9), 3.2); put(b, bell(587.3, 4, 0.35), 3.2, 0.3)
    for i, s in enumerate((0.7, 1.55, 2.4)):                                 # sound-wave pings from the mic
        put(b, bell(880 * (1 + i * .12), 2.2, 0.2), s, -0.4 + i * 0.4)
    for s in (4.2, 5.4, 6.6): put(b, bell(293.7 if s < 6 else 349.2, 3, 0.18), s, 0.2)
    put(b, kick(0.4), 8.0); put(b, bell(440, 3, 0.3), 8.0, 0.1)             # end lockup
    finish(b, "wisdom", wet=0.32)

# ---------------------------------------------------------------- STORY HOUR (C major, warm, kalimba/pluck)
def story():
    b = buf()
    put(b, pad([65.4, 98, 130.8, 196, 261.6], 10, 0.4, att=1.8, rel=1.8), 0)
    pent = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
    # clock ticking 0.3 -> 2.8 with accelerating ticks
    ts, tcur = [], 0.3
    while tcur < 2.8: ts.append(tcur); tcur += 0.42 * (1 - 0.7 * (tcur - 0.3) / 2.5) 
    for i, s in enumerate(ts): put(b, tick(0.35), s, (-1) ** i * 0.3)
    for i, s in enumerate(np.linspace(0.4, 2.6, 8)): put(b, pluck(pent[(i * 2) % 6 if i < 6 else 5 - i % 3], 1.8, 0.28), s, -0.5 + i * 0.14)
    put(b, riser(1.0, 0.4), 1.9)
    put(b, whoosh(0.7, 0.4), 2.45)
    put(b, sub_hit(0.9), 3.0); put(b, bell(523.25, 4.5, 0.55), 3.0); put(b, bell(783.99, 4, 0.3), 3.0, 0.3)
    # reveal arpeggio under title
    seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880, 1046.5, 1318.5]
    for i, f in enumerate(seq): put(b, pluck(f, 1.6, 0.32), 3.3 + i * 0.3, -0.4 + i * 0.1)
    put(b, bell(1046.5, 3, 0.25), 7.0); put(b, pad([130.8, 196, 261.6, 329.6], 3, 0.25, att=0.4, rel=1.2), 7.0)
    finish(b, "story", wet=0.3)

# ---------------------------------------------------------------- HOMEBOYS (104 bpm, upbeat hip-hop)
def homeboys():
    b = buf(); beat = 60 / 104
    bass_notes = [55, 55, 65.4, 49]    # A1 A1 C2 G1
    for bar in range(5):
        base = bar * 4 * beat
        if base > 7.9: break
        for i, off in enumerate((0, 1, 2, 3)):
            ts = base + off * beat
            if ts >= 10: continue
            if off in (0, 2): put(b, kick(0.95), ts)
            if off in (1, 3): put(b, snare(0.55), ts); put(b, clap(0.35), ts)
        if bar >= 0:
            put(b, kick(0.7), base + 2.5 * beat)
    for k in range(int(10 / (beat / 2))):
        ts = k * beat / 2
        if ts < 8.1: put(b, hat(0.22 if k % 2 else 0.14), ts, 0.4 if k % 4 else -0.4)
    # bass line follows 4 bar loop, 2 notes per bar
    for bar in range(5):
        base = bar * 4 * beat; f = bass_notes[bar % 4]
        for off in (0, 1.5, 2, 3):
            if base + off * beat < 8: put(b, bass(f * (1.5 if off == 1.5 else 1), 0.35, 0.5), base + off * beat)
    # chord stabs on offbeats
    for bar in range(5):
        base = bar * 4 * beat
        for off in (0.5, 2.5):
            if base + off * beat < 8: put(b, pad([220, 261.6, 329.6] if bar % 2 == 0 else [196, 246.9, 293.7], 0.3, 0.14, att=0.01, rel=0.2), base + off * beat, 0.3)
    # word slam hits (1 per beat from 0.6s) & title slam
    put(b, riser(1.1, 0.3), 3.0)
    t_title = 7 * beat
    put(b, sub_hit(1.0), t_title); put(b, clap(0.7), t_title); put(b, bell(440, 2.5, 0.25), t_title, 0.2)
    put(b, whoosh(0.5, 0.35), t_title - 0.35)
    # outro stop: bass drop & tag
    put(b, kick(0.9), 8.1); put(b, sub_hit(0.7, 1.6), 8.1); put(b, bell(659.25, 2, 0.2), 8.1)
    finish(b, "homeboys", wet=0.16, fade=0.45)

if __name__ == "__main__":
    wisdom(); story(); homeboys()

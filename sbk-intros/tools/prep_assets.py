# Builds transparent logo assets from the client's JPG logos.
from PIL import Image
import numpy as np
ORANGE = (252, 85, 19)

def bbox(a, thr=8):
    ys, xs = np.where(a > thr)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

# --- S mark (orange on black) -> orange w/ alpha
im = np.asarray(Image.open("public/mark.jpg").convert("RGB")).astype(float)
alpha = np.clip(im[..., 0] / ORANGE[0], 0, 1)
x0, y0, x1, y1 = bbox(alpha * 255)
alpha = alpha[y0:y1, x0:x1]
out = np.zeros(alpha.shape + (4,), dtype=np.uint8)
out[..., 0], out[..., 1], out[..., 2] = ORANGE
out[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(out, "RGBA").save("public/sbk-mark.png")
print("mark", out.shape)

# --- Wordmark "SBK MEDIA TV" (black on cream) -> white + black w/ alpha
lg = np.asarray(Image.open("public/logo-full.jpg").convert("RGB")).astype(float)
lum = lg.mean(axis=2)
bg = np.median(lum[:50, :50])
a = np.clip((bg - lum) / (bg - 25), 0, 1)
a[:, :470] = 0                      # drop the mark, keep only the text
x0, y0, x1, y1 = bbox(a * 255)
a = a[y0:y1, x0:x1]
for name, col in (("white", (255, 255, 255)), ("black", (12, 12, 12))):
    o = np.zeros(a.shape + (4,), dtype=np.uint8)
    o[..., 0], o[..., 1], o[..., 2] = col
    o[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(o, "RGBA").save(f"public/sbk-wordmark-{name}.png")
print("wordmark", a.shape)

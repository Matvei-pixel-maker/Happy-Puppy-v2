import json, struct
import numpy as np

BASE = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\public\models"

with open(BASE + r"\cup.gltf", "r", encoding="utf-8") as f:
    g = json.load(f)
with open(BASE + r"\scene.bin", "rb") as f:
    bin_data = f.read()

CTYPE = {5120: ("b", 1), 5121: ("B", 1), 5122: ("h", 2), 5123: ("H", 2), 5125: ("I", 4), 5126: ("f", 4)}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def read_accessor(idx):
    acc = g["accessors"][idx]
    bv = g["bufferViews"][acc["bufferView"]]
    fmt, size = CTYPE[acc["componentType"]]
    ncomp = NCOMP[acc["type"]]
    count = acc["count"]
    base = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    stride = bv.get("byteStride", 0) or (size * ncomp)
    out = np.zeros((count, ncomp), dtype=np.float64)
    for i in range(count):
        off = base + i * stride
        out[i] = struct.unpack_from("<" + fmt * ncomp, bin_data, off)
    return out


prim = g["meshes"][0]["primitives"][0]
POS = read_accessor(prim["attributes"]["POSITION"])
IDX = read_accessor(prim["indices"]).astype(np.int64).ravel()

n = POS.shape[0]

# Union-Find
parent = np.arange(n, dtype=np.int64)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra


tris = IDX.reshape(-1, 3)
for a, b, c in tris:
    union(a, b)
    union(b, c)
    union(a, c)

roots = np.array([find(i) for i in range(n)])
uniq_roots = np.unique(roots)

comps = []
for r in uniq_roots:
    mask = roots == r
    pts = POS[mask]
    mn = pts.min(axis=0)
    mx = pts.max(axis=0)
    ctr = (mn + mx) / 2
    comps.append({
        "root": int(r),
        "verts": int(mask.sum()),
        "center": ctr,
        "vertex_indices": np.where(mask)[0],
    })

# Sort by center X
comps.sort(key=lambda c: c["center"][0])

print(f"Total components: {len(comps)}")
print("\nComponents sorted by center X (with gaps):")
for i, c in enumerate(comps):
    gap = ""
    if i > 0:
        g = c["center"][0] - comps[i-1]["center"][0]
        gap = f"  gap_from_prev={g:+.4f}"
    print(f"  {i:3d}: verts={c['verts']:5d} centerX={c['center'][0]:+.4f} centerY={c['center'][1]:+.4f} centerZ={c['center'][2]:+.4f}{gap}")

# Find large gaps
print("\n=== Large gaps (>0.02) between consecutive components ===")
for i in range(1, len(comps)):
    g = comps[i]["center"][0] - comps[i-1]["center"][0]
    if g > 0.02:
        print(f"  Between {i-1} and {i}: gap={g:+.4f} (comp {i-1} centerX={comps[i-1]['center'][0]:+.4f} -> comp {i} centerX={comps[i]['center'][0]:+.4f})")

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
parent = np.arange(n, dtype=np.int64)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


for a, b, c in IDX.reshape(-1, 3):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra
    ra, rc = find(a), find(c)
    if ra != rc:
        parent[rc] = ra

roots = np.array([find(i) for i in range(n)])
uniq = np.unique(roots)

comps = []
for r in uniq:
    pts = POS[roots == r]
    mn, mx = pts.min(axis=0), pts.max(axis=0)
    comps.append({"root": int(r), "count": int(pts.shape[0]), "min": mn, "max": mx})


def box_gap(a, b):
    d = np.maximum(0.0, np.maximum(a["min"] - b["max"], b["min"] - a["max"]))
    return float(np.linalg.norm(d))


M = len(comps)
print("components:", M)

for TH in [0.0, 0.002, 0.004, 0.006, 0.008, 0.01, 0.012, 0.015, 0.02, 0.03, 0.04, 0.05, 0.08, 0.12]:
    cp = list(range(M))

    def cf(a):
        while cp[a] != a:
            cp[a] = cp[cp[a]]
            a = cp[a]
        return a

    for i in range(M):
        for j in range(i + 1, M):
            if box_gap(comps[i], comps[j]) <= TH:
                ri, rj = cf(i), cf(j)
                if ri != rj:
                    cp[rj] = ri
    groups = {}
    for i in range(M):
        groups.setdefault(cf(i), []).append(i)
    print(f"threshold {TH:.3f} -> {len(groups)} clusters, verts per cluster: "
          f"{sorted((sum(comps[i]['count'] for i in v) for v in groups.values()), reverse=True)[:10]}")

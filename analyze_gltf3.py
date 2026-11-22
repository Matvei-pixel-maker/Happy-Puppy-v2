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
    comps.append({"root": int(r), "count": int(pts.shape[0]), "min": mn, "max": mx, "center": (mn + mx) / 2})

# Merge close components (gap <= 0.02)
M = len(comps)
cp = list(range(M))


def cf(a):
    while cp[a] != a:
        cp[a] = cp[cp[a]]
        a = cp[a]
    return a


def box_gap(a, b):
    d = np.maximum(0.0, np.maximum(a["min"] - b["max"], b["min"] - a["max"]))
    return float(np.linalg.norm(d))


for i in range(M):
    for j in range(i + 1, M):
        if box_gap(comps[i], comps[j]) <= 0.02:
            ri, rj = cf(i), cf(j)
            if ri != rj:
                cp[rj] = ri

groups = {}
for i in range(M):
    groups.setdefault(cf(i), []).append(i)

clusters = []
for gid, idxs in groups.items():
    allmin = np.min([comps[i]["min"] for i in idxs], axis=0)
    allmax = np.max([comps[i]["max"] for i in idxs], axis=0)
    tot = sum(comps[i]["count"] for i in idxs)
    clusters.append({
        "parts": len(idxs),
        "verts": tot,
        "min": allmin,
        "max": allmax,
        "center": (allmin + allmax) / 2,
        "size": allmax - allmin,
    })

print(f"Merged clusters (gap<=0.02): {len(clusters)}")
for c in clusters:
    print(f"  parts={c['parts']:3d} verts={c['verts']:6d} center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f}) size=({c['size'][0]:.4f},{c['size'][1]:+.4f},{c['size'][2]:+.4f})")

# Try k-means on cluster centers for k=6
centers = np.array([c["center"] for c in clusters])
print(f"\nCluster centers shape: {centers.shape}")

# Simple k-means
def kmeans(X, k, iters=100):
    rng = np.random.RandomState(42)
    idx = rng.choice(len(X), k, replace=False)
    centroids = X[idx].copy()
    for _ in range(iters):
        d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
        labels = d.argmin(axis=1)
        new_c = np.array([X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j] for j in range(k)])
        if np.allclose(new_c, centroids):
            break
        centroids = new_c
    d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
    labels = d.argmin(axis=1)
    return centroids, labels

for k in [4, 5, 6, 7, 8]:
    centroids, labels = kmeans(centers, k)
    print(f"\nk={k}:")
    for j in range(k):
        mask = labels == j
        tot_verts = sum(clusters[i]["verts"] for i in range(len(clusters)) if mask[i])
        tot_parts = sum(clusters[i]["parts"] for i in range(len(clusters)) if mask[i])
        print(f"  group {j}: {mask.sum()} clusters, {tot_parts} parts, {tot_verts} verts, center=({centroids[j,0]:+.4f},{centroids[j,1]:+.4f},{centroids[j,2]:+.4f})")

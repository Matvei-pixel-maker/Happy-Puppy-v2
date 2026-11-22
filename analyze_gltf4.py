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

print(f"Raw connected components: {len(comps)}")
print("Components sorted by center X:")
comps_sorted = sorted(comps, key=lambda c: c["center"][0])
for i, c in enumerate(comps_sorted):
    print(f"  {i:3d}: n={c['count']:4d} center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f}) size=({c['size'][0] if 'size' in c else 0:.4f},{c['max'][1]-c['min'][1]:+.4f},{c['max'][2]-c['min'][2]:+.4f})")

# k-means on component centers with k=6
centers = np.array([c["center"] for c in comps])
counts = np.array([c["count"] for c in comps])


def kmeans(X, k, iters=200, seed=42):
    rng = np.random.RandomState(seed)
    if len(X) < k:
        return None, None
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


print("\n=== k-means with k=6 on component centers ===")
centroids, labels = kmeans(centers, 6)
for j in range(6):
    mask = labels == j
    tot_verts = counts[mask].sum()
    tot_parts = mask.sum()
    ctr = centroids[j]
    # bounding box of all points in this cluster
    allpts = POS[np.isin(roots, [comps[i]["root"] for i in range(len(comps)) if mask[i]])]
    mn = allpts.min(axis=0)
    mx = allpts.max(axis=0)
    print(f"  cup{j}: parts={tot_parts:3d} verts={tot_verts:6d} center=({ctr[0]:+.4f},{ctr[1]:+.4f},{ctr[2]:+.4f})")
    print(f"         min=({mn[0]:+.4f},{mn[1]:+.4f},{mn[2]:+.4f}) max=({mx[0]:+.4f},{mx[1]:+.4f},{mx[2]:+.4f}) size=({(mx-mn)[0]:.4f},{(mx-mn)[1]:.4f},{(mx-mn)[2]:.4f})")

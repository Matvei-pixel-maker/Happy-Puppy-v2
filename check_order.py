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
    out = np.zeros((count, ncomp), dtype=np.float32)
    for i in range(count):
        off = base + i * stride
        out[i] = struct.unpack_from("<" + fmt * ncomp, bin_data, off)
    return out


prim = g["meshes"][0]["primitives"][0]
POS = read_accessor(prim["attributes"]["POSITION"])
NOR = read_accessor(prim["attributes"]["NORMAL"])
UV = read_accessor(prim["attributes"]["TEXCOORD_0"])
IDX = read_accessor(prim["indices"]).astype(np.int64).ravel()

n = POS.shape[0]

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

centers = np.array([c["center"] for c in comps])


def kmeans_3d(X, k, iters=500, seed=42):
    rng = np.random.RandomState(seed)
    centroids = [X[rng.choice(len(X))]]
    for _ in range(k - 1):
        d = ((X[:, None, :] - np.array(centroids)[None, :, :]) ** 2).sum(axis=2)
        min_d = d.min(axis=1)
        probs = min_d / min_d.sum()
        idx = rng.choice(len(X), p=probs)
        centroids.append(X[idx])
    centroids = np.array(centroids)
    for _ in range(iters):
        d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
        labels = d.argmin(axis=1)
        new_c = np.array([X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j] for j in range(k)])
        if np.allclose(new_c, centroids):
            break
        centroids = new_c
    d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
    labels = d.argmin(axis=1)
    return labels, centroids


best_result = None
best_score = float('inf')
for seed in range(50):
    labels, centroids = kmeans_3d(centers, 6, seed=seed)
    verts_arr = np.array([c["verts"] for c in comps])
    cluster_verts = [verts_arr[labels == j].sum() for j in range(6)]
    score = max(cluster_verts) - min(cluster_verts)
    if score < best_score:
        best_score = score
        best_result = (labels.copy(), centroids.copy())

labels, centroids = best_result
order = np.argsort(centroids[:, 0])
label_map = np.zeros(6, dtype=np.int64)
for new_idx, old_idx in enumerate(order):
    label_map[old_idx] = new_idx
labels = label_map[labels]

print("6 cups sorted by center X (left to right in scene):")
for cup_id in range(6):
    mask = labels == cup_id
    ctr = centroids[mask].mean(axis=0)
    print(f"  cup{cups_id if False else cup_id}: centerX={ctr[0]:+.4f} centerZ={ctr[2]:+.4f} verts={comps[np.where(labels == cup_id)[0][0]]['verts']}")

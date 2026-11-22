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

print(f"Total vertices: {POS.shape[0]}, triangles: {IDX.shape[0] // 3}")

# Manual k-means on all vertices with k=6
def kmeans(X, k, iters=300, seed=42):
    rng = np.random.RandomState(seed)
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
    return labels, centroids

labels, centers = kmeans(POS, 6)

print("\n=== 6 cups from k-means on vertices ===")
for j in range(6):
    mask = labels == j
    pts = POS[mask]
    mn = pts.min(axis=0)
    mx = pts.max(axis=0)
    ctr = (mn + mx) / 2
    sz = mx - mn
    print(f"  cup{j}: verts={mask.sum():6d}")
    print(f"         center=({ctr[0]:+.4f},{ctr[1]:+.4f},{ctr[2]:+.4f})")
    print(f"         min=({mn[0]:+.4f},{mn[1]:+.4f},{mn[2]:+.4f})")
    print(f"         max=({mx[0]:+.4f},{mx[1]:+.4f},{mx[2]:+.4f})")
    print(f"         size=({sz[0]:.4f},{sz[1]:.4f},{sz[2]:.4f})")
    print()

# Check triangle assignment - each triangle should belong to one cup
tri_labels = labels[IDX.reshape(-1, 3)]
pure_tris = np.all(tri_labels == tri_labels[:, [0]], axis=1)
print(f"Pure triangles (all 3 vertices same cup): {pure_tris.sum()}/{len(pure_tris)} ({100*pure_tris.mean():.1f}%)")

# Save cluster info
cluster_info = []
for j in range(6):
    mask = labels == j
    pts = POS[mask]
    mn = pts.min(axis=0)
    mx = pts.max(axis=0)
    cluster_info.append({
        "index": j,
        "verts": int(mask.sum()),
        "center": (mn + mx) / 2,
        "min": mn,
        "max": mx,
    })

cluster_info.sort(key=lambda c: c["center"][0])
print("=== Sorted by center X ===")
for c in cluster_info:
    print(f"  cup#{c['index']}: center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f}) verts={c['verts']}")

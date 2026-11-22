import json, struct
import numpy as np

BASE = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\public\models"
OUT = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\src\data\cups6.json"

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

# Sort cups by center X (left to right)
order = np.argsort(centers[:, 0])
label_map = np.zeros(6, dtype=np.int64)
for new_idx, old_idx in enumerate(order):
    label_map[old_idx] = new_idx
labels = label_map[labels]

# Build per-cup data: pure triangles only
cups = []
for cup_id in range(6):
    tris = IDX.reshape(-1, 3)
    tri_cup = labels[tris]
    mask = np.all(tri_cup == cup_id, axis=1)
    cup_tris = tris[mask]

    used_verts = np.unique(cup_tris.ravel())
    vmap = {int(v): i for i, v in enumerate(used_verts)}
    local_indices = np.array([vmap[int(v)] for v in cup_tris.ravel()], dtype=np.uint32).reshape(-1, 3)

    cup_pos = POS[used_verts].astype(np.float32)
    cup_nor = NOR[used_verts].astype(np.float32)
    cup_uv = UV[used_verts].astype(np.float32)

    # Center geometry
    mn = cup_pos.min(axis=0)
    mx = cup_pos.max(axis=0)
    center = (mn + mx) / 2
    cup_pos_centered = cup_pos - center

    cups.append({
        "cup_id": cup_id,
        "vertex_count": int(len(used_verts)),
        "triangle_count": int(len(cup_tris)),
        "positions": cup_pos_centered.flatten().tolist(),
        "normals": cup_nor.flatten().tolist(),
        "uvs": cup_uv.flatten().tolist(),
        "indices": local_indices.flatten().tolist(),
        "center": center.tolist(),
        "size": (mx - mn).tolist(),
    })

# Sort by center X
cups.sort(key=lambda c: c["center"][0])

with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"cups": cups}, f)

print(f"Saved {len(cups)} cups to {OUT}")
for c in cups:
    print(f"  cup {c['cup_id']}: verts={c['vertex_count']} tris={c['triangle_count']} center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f}) size=({c['size'][0]:.4f},{c['size'][1]:.4f},{c['size'][2]:.4f})")

import json, struct
import numpy as np
from PIL import Image

BASE = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\public\models"

# Load GLTF
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
UV = read_accessor(prim["attributes"]["TEXCOORD_0"])
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

print(f"Connected components: {len(comps)}")

# 3D k-means on centers
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
        print(f"  seed {seed}: score={score}, verts={cluster_verts}")

labels, centroids = best_result
order = np.argsort(centroids[:, 0])
label_map = np.zeros(6, dtype=np.int64)
for new_idx, old_idx in enumerate(order):
    label_map[old_idx] = new_idx
labels = label_map[labels]

# Build vertex_to_cup mapping
vertex_to_cup = np.full(n, -1, dtype=np.int64)
for cup_id in range(6):
    comp_indices = np.where(labels == cup_id)[0]
    all_vert_indices = np.concatenate([comps[i]["vertex_indices"] for i in comp_indices])
    vertex_to_cup[all_vert_indices] = cup_id

# Load baseColor texture
tex_path = BASE + "\\" + g["images"][0]["uri"].replace("/", "\\")
img = Image.open(tex_path).convert("RGB")
img_w, img_h = img.size
img_arr = np.array(img)
print(f"\nTexture: {img_w}x{img_h}")

# Sample average color per cup using UV coordinates
expected_colors = {
    0: ("Taro Cloud (purple)", "#8f7ba8"),
    1: ("Matcha Silk (green)", "#7d8a62"),
    2: ("Brown Sugar (caramel)", "#a96b43"),
    3: ("Lychee Bloom (pink)", "#c98e82"),
    4: ("Hojicha Cream (cream)", "#d8c3a0"),
    5: ("Oolong Mist (light purple)", "#a093c7"),
}

print("\nCup colors sampled from texture:")
cup_colors = []
for cup_id in range(6):
    mask = labels == cup_id
    comp_indices = np.where(mask)[0]
    all_verts = np.concatenate([comps[i]["vertex_indices"] for i in comp_indices])
    
    # Get UVs for this cup's triangles
    tri_cup_labels = vertex_to_cup[tris]
    pure_mask = np.all(tri_cup_labels == cup_id, axis=1)
    cup_tris = tris[pure_mask]
    
    # Collect UVs of used vertices
    used_verts = np.unique(cup_tris.ravel())
    uvs = UV[used_verts]
    
    # Map UVs to texture pixels
    u = np.clip(uvs[:, 0], 0, 1)
    v = np.clip(1.0 - uvs[:, 1], 0, 1)  # flip V
    px = (u * (img_w - 1)).astype(int)
    py = (v * (img_h - 1)).astype(int)
    colors = img_arr[py, px]
    avg_color = colors.mean(axis=0)
    
    # Convert to hex
    hex_color = "#{:02x}{:02x}{:02x}".format(int(avg_color[0]), int(avg_color[1]), int(avg_color[2]))
    
    # Find closest expected color
    best_match = None
    best_dist = float('inf')
    for exp_id, (name, exp_hex) in expected_colors.items():
        exp_rgb = np.array([int(exp_hex[1:3], 16), int(exp_hex[3:5], 16), int(exp_hex[5:7], 16)])
        dist = np.linalg.norm(colors.mean(axis=0) - exp_rgb)
        if dist < best_dist:
            best_dist = dist
            best_match = (exp_id, name)
    
    cup_colors.append({
        "cup_id": cup_id,
        "avg_rgb": avg_color.tolist(),
        "hex": hex_color,
        "closest": best_match,
        "verts": len(used_verts),
        "center": centers[mask].mean(axis=0).tolist(),
    })
    print(f"  cup {cup_id}: avg RGB=({avg_color[0]:.0f},{avg_color[1]:.0f},{avg_color[2]:.0f}) hex={hex_color} "
          f"closest={best_match} verts={len(used_verts)}")

# Sort cups by X position (left to right in scene)
cup_colors.sort(key=lambda c: c["center"][0])
print("\nCups sorted by center X (left to right in scene):")
for c in cup_colors:
    print(f"  scene X={c['center'][0]:+.4f}: cup_id={c['cup_id']} {c['closest'][1]} ({c['hex']})")

# Determine the correct order: purple, green, caramel, pink, cream, light purple
# Match each cup to its expected position
expected_order = [0, 1, 2, 3, 4, 5]  # indices into expected_colors
name_to_cup_id = {}
for c in cup_colors:
    exp_id = c["closest"][0]
    name_to_cup_id[exp_id] = c["cup_id"]

print("\nMapping: expected position -> actual cup_id")
for exp_id in range(6):
    print(f"  {expected_colors[exp_id][0]} -> cup_id={name_to_cup_id.get(exp_id, '?')}")

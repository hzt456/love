# -*- coding: utf-8 -*-
# 扫描 photos/ 文件夹，自动更新 data.js 里的照片列表
# 已填过的说明文字（date）会保留，新照片的说明默认为文件名
import os, re, sys

BASE = os.path.dirname(os.path.abspath(__file__))
PHOTOS_DIR = os.path.join(BASE, 'photos')
DATA_JS = os.path.join(BASE, 'data.js')
EXTS = ('.jpg', '.jpeg', '.png', '.gif', '.webp')

with open(DATA_JS, encoding='utf-8-sig') as f:
    src = f.read()

# 保留已有的说明文字: 文件名 -> date
old = dict(re.findall(r'\{\s*src:\s*"photos/([^"]+)",\s*date:\s*"([^"]*)"\s*\}', src))
old.update(re.findall(r'\{\s*src:\s*"([^"/]+)",\s*date:\s*"([^"]*)"\s*\}', src))  # 兼容没带 photos/ 前缀的旧写法

files = sorted(f for f in os.listdir(PHOTOS_DIR) if f.lower().endswith(EXTS))
if not files:
    print('photos/ 文件夹里还没有照片'); sys.exit(0)

lines = []
for fn in files:
    caption = old.get(fn) or os.path.splitext(fn)[0]
    lines.append('  { src: "photos/%s", date: "%s" },' % (fn, caption))
new_block = 'const PHOTOS = [\n' + '\n'.join(lines) + '\n];'

new_src, n = re.subn(r'const PHOTOS = \[.*?\];', new_block, src, flags=re.S)
if n != 1:
    print('没找到 data.js 里的 PHOTOS 列表，更新失败'); sys.exit(1)
with open(DATA_JS, 'w', encoding='utf-8-sig') as f:
    f.write(new_src)

print('已更新 %d 张照片:' % len(files))
for fn in files:
    print('  %s -> %s' % (fn, old.get(fn) or os.path.splitext(fn)[0]))

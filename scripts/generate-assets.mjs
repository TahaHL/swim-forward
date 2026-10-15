import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#142b40"/><g fill="none" stroke="#6cd4cc" stroke-width="22" stroke-linecap="round"><path d="M128 196 Q160 164 192 196 T256 196 T320 196 T384 196"/><path d="M128 256 Q160 224 192 256 T256 256 T320 256 T384 256"/><path d="M128 316 Q160 284 192 316 T256 316 T320 316 T384 316"/></g></svg>';
await writeFile('public/favicon.svg',svg);
for(const size of [192,512])await sharp(Buffer.from(svg)).resize(size,size).png().toFile(`public/icon-${size}.png`);

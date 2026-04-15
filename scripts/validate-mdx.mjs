import { compile } from '@mdx-js/mdx'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const ROOT = new URL('..', import.meta.url).pathname
let errors = 0

function findMdx(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'scripts') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      findMdx(full)
    } else if (entry.endsWith('.mdx')) {
      validate(full)
    }
  }
}

async function validate(file) {
  const content = readFileSync(file, 'utf8')
  try {
    await compile(content)
  } catch (err) {
    const rel = relative(ROOT, file)
    console.error(`✗ ${rel}`)
    console.error(`  ${err.message}\n`)
    errors++
  }
}

await findMdx(ROOT)

if (errors === 0) {
  console.log(`✓ All MDX files are valid`)
} else {
  console.error(`\n${errors} file(s) failed MDX validation`)
  process.exit(1)
}

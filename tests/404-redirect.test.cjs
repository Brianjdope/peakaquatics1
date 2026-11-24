// public/404.html is served by GitHub Pages for any address that doesn't exist and
// forwards it to the matching hash page. Run its script against fake addresses.
const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const html = fs.readFileSync(path.join(__dirname, '..', 'public', '404.html'), 'utf8')
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]

function redirectFor(pathname) {
  let target = null
  vm.runInNewContext(script, { location: { pathname, replace: (url) => { target = url } } })
  return target
}

test('page names, with or without suffixes, go to their page', () => {
  assert.strictEqual(redirectFor('/services'), '/#/services')
  assert.strictEqual(redirectFor('/about/'), '/#/about')
  assert.strictEqual(redirectFor('/contact-us'), '/#/contact')
  assert.strictEqual(redirectFor('/Records.html'), '/#/records')
  assert.strictEqual(redirectFor('/placements'), '/#/placements')
})

test('old article and blog links go to News', () => {
  assert.strictEqual(redirectFor('/news/kate-hurst-national-team'), '/#/news')
  assert.strictEqual(redirectFor('/blog/2023/kate-wins'), '/#/news')
})

test('common aliases map to the closest page', () => {
  assert.strictEqual(redirectFor('/booking'), '/#/services')
  assert.strictEqual(redirectFor('/book-now'), '/#/services')
  assert.strictEqual(redirectFor('/photos'), '/#/gallery')
  assert.strictEqual(redirectFor('/privacy-policy'), '/#/terms')
})

test('anything else goes to the home page', () => {
  assert.strictEqual(redirectFor('/nonexistent-page'), '/')
  assert.strictEqual(redirectFor('/newsletter'), '/')
  assert.strictEqual(redirectFor('/'), '/')
})

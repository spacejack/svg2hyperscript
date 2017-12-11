const libxmljs = require('libxmljs')
const {js_beautify} = require('js-beautify')

/**
 * @param {{[id: string]: any}} obj
 */
function isEmpty (obj) {
	return Object.keys(obj).length === 0
}

/**
 * @param {{[id: string]: any}} attrs
 */
function attr2h (attrs) {
	const attributes = {}
	const dataSet = {}

	for (const v of attrs) {
		const key = v.name()
		const value = v.value()

		const maybeData = key.split('-')
		if(maybeData[0] === 'data') {
			dataSet[maybeData[1]] = value
		} else {
			attributes[key] = value
		}
	}

	if (!isEmpty(dataSet)) {
		attributes['dataset'] = dataSet
	}

	return isEmpty(attributes) ? '' : JSON.stringify(attributes)
}

/**
 * @param {*} node
 * @param {string} hfn
 */
function node2h (node, hfn) {
	if (node.name() === 'text') {
		const str = node.toString().trim()
		return str === '' ? str : `'${str}'`
	}

	const children = node.childNodes().reduce(
		(acc, child) => {
			const ch = node2h(child, hfn)
			if (ch !== '') {
				acc.push(ch)
			}
			return acc
		},
		[]
	).join(',\n')

	const attrsH = attr2h(node.attrs())

	let src = `${hfn}('${node.name()}'`
	if (attrsH.length > 0) {
		src += `, ${attrsH}`
	}
	if (children.length > 0) {
		src += `, [${children}]`
	}
	src += ')'

	return js_beautify(src)
}

/**
 * @param {string} svg
 * @param {string?} hfn
 */
function svg2hyperscript (svg, hfn = 'h') {
	const doc = libxmljs.parseXml(svg)
	return node2h(doc.root(), hfn)
}

module.exports = svg2hyperscript

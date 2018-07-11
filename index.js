const debug = require('@ff0000-ad-tech/debug')
const log = debug('index-variation-resolve-plugin')

const name = 'IndexVariationResolvePlugin'

class IndexVariationResolvePlugin {
	constructor(indexName) {
		this.indexName = indexName
	}

	// TODO: use fallback
	apply(resolver) {
		resolver.getHook('resolve').tapAsync(name, (request, resolveContext, callback) => {
			const innerRequest = request.request
			if (!innerRequest || !innerRequest.includes('@index')) return callback()

			const target = resolver.getHook('described-resolve')
			const newRequestStr = innerRequest.replace('@index', this.indexName)

			const newRequestObj = Object.assign({}, request, { request: newRequestStr })
			resolver.doResolve(
				target,
				newRequestObj,
				`Using @index alias to change ${innerRequest} to ${newRequestStr}`,
				resolveContext,
				(err, result) => {
					if (err) return callback(err)

					if (result === undefined) return callback(null, null)
					callback(null, result)
				}
			)
		})
	}
}

module.exports = IndexVariationResolvePlugin

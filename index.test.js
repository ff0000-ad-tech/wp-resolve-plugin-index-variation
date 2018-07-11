const ResolverFactory = require('enhanced-resolve').ResolverFactory
const plugin = require('./index.js')
const path = require('path')

const resolveAndCheckWithIndexName = indexName => (
	pathToResolve,
	expectedPath,
	options
) => {
	return done => {
		const resolver = ResolverFactory.createResolver({
			fileSystem: require('fs'),
			plugins: [new plugin(indexName)]
		})
		resolver.resolve({}, __dirname, pathToResolve, {}, (err, result) => {
			if (err) {
				return done(err)
			}
			expect(result).toEqual(path.resolve(__dirname, expectedPath))
			done()
		})
	}
}

describe('Project with multiple indices', () => {
	const coolResolveAndCheck = resolveAndCheckWithIndexName('cool_index')
	it(
		'handles normal requests normally',
		coolResolveAndCheck(
			'./__mocks__/cool_index/file.js',
			'./__mocks__/cool_index/file.js'
		)
	)

	it(
		'@index/file.js should match to cool_index/file.js',
		coolResolveAndCheck(
			'./__mocks__/@index/file.js',
			'./__mocks__/cool_index/file.js'
		)
	)

	it(
		'@index/file.js should match to cool_index/file.js',
		resolveAndCheckWithIndexName('nonexistent')(
			'./__mocks__/@index/file.js',
			'./__mocks__/file.js'
		)
	)
})

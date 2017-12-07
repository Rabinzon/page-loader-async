install:
	npm i

start:
	npm run babel-node -- src/bin/page-loader ${args}

watch-tests:
	npm run test -- --watch

test:
	npm run test

lint:
	npm run lint

publish:
	npm publish

coverage:
	npm run coverage

install:
	npm i

start:
	npm run babel-node -- src/bin/page-loader ${args}

debug:
	DEBUG="page-loader:*" npm run babel-node -- src/bin/page-loader --output ./tmp https://ru.hexlet.io

watch-tests:
	DEBUG="page-loader:*" npm run test -- --watch

test:
	npm run test

lint:
	npm run lint

publish:
	npm publish

coverage:
	npm run coverage

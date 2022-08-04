.PHONY: lint
lint:
	npx eslint pages/**

.PHONY: lint-fix
lint-fix:
	npx eslint pages/** --fix

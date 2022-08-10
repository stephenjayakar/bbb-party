LINT_FILES = $(shell find pages -name '*.ts' -o -name '*.tsx' | sort | xargs)
ESLINT = npx eslint

.PHONY: lint
lint:
	$(ESLINT) -- $(LINT_FILES)

.PHONY: lint-fix
lint-fix:
	$(ESLINT) --fix -- $(LINT_FILES)

.PHONY: watch
watch:
	npm run dev

all:
	npm run build

dev:
	npm run dev

clean:
	npm run clean

typedoc:
	npm run typedoc

icons:
	cd script && ./update-contextual-identities-icons.sh

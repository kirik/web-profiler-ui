all: minifiers_install minify

minifiers_install:
	npm install uglify-js uglifycss -g

minify:
	uglifyjs --compress --mangle  --comments /^!/ -- view/script.js > view/script.min.js
	uglifycss view/style.css > view/style.min.css
	cat view/template.html | tr -d '\n' | tr -s ' ' > view/template.min.html
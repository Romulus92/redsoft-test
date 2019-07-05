const gulp = require('gulp');

const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const babel = require('gulp-babel');
const minify = require('gulp-minify');

const del = require('del');

const browserSync = require('browser-sync').create();

const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminGifsicle = require('imagemin-gifsicle')
const imageminOptipng = require('imagemin-optipng')

const pug = require('gulp-pug')
const svgSprite = require('gulp-svg-sprite');

const paths = {
	root: './docs',
	templates: {
		pages: 'src/templates/pages/*.pug',
		src: 'src/templates/**/*.pug'
	},
	styles: {
		src: 'src/styles/**/*.scss',
		dest: 'docs/assets/styles/'
	},
	images: {
		src: 'src/images/**/*.*',
		dest: 'docs/assets/images/'
	},
	scripts: {
		src: 'src/scripts/**/*.js',
		dest: 'docs/assets/scripts/'
	},
	fonts: {
		src: 'src/webfonts/**/*.*',
		dest: 'docs/assets/webfonts'
	},
	sprite: {
		src: 'src/sprites/**/*.png',
		dest: 'docs/assets/sprites'
	},
	svgsprite: {
		src: 'src/svg/*.svg',
		dest: 'docs/assets/svg'
	}
}

// перевод из scss в css + префиксы и минимизация
gulp.task('styles', function() {
	return gulp.src('./src/styles/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'compressed',
			includePaths: require('node-normalize-scss').includePaths
		}))
		.pipe(postcss([autoprefixer()]))
		/* .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
				cascade: true
		})) */
		.pipe(sourcemaps.write())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
});

// очистка

gulp.task('clean', function() {
	return del(paths.root);
});

// перенос JS

gulp.task('common', function() {
	return gulp.src([
		'src/scripts/pages/app.js',
		])
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(minify({
		ext: {
			min: '.min.js'
		}
	}))
	.pipe(gulp.dest('src/scripts/trans'))
});

gulp.task('libs', function() {
	return gulp.src([
		//Библиотеки и плагины
		//Свой код
		'src/scripts/trans/app.min.js', 
	])
	.pipe(gulp.dest(paths.scripts.dest))
	/* .pipe(browserSync.reload({ stream: true })) */
})

gulp.task('scripts', gulp.series('common', 'libs'));

//Pug to HTML

gulp.task('templates', function() {
	return gulp.src(paths.templates.pages)
	.pipe(pug())
	.pipe(gulp.dest(paths.root));
});

//gulp watcher
gulp.task('change', function() {
	gulp.watch(paths.styles.src, gulp.series('styles'));
	gulp.watch(paths.images.src, gulp.series('images'));
	gulp.watch(['src/scripts/pages/*.js',
							'src/scripts/vendors/*.js'], gulp.series('scripts'));
	gulp.watch(paths.templates.src, gulp.series('templates'));
});

// локальный сервер + livereload (встроенный)
gulp.task('server', function() {
	browserSync.init({
		server: {
				baseDir: "./docs"
		}
	});

	browserSync.watch("/src/styles/main.scss", ['styles']);
	browserSync.watch(paths.templates.src).on('change', browserSync.reload);
	browserSync.watch(paths.scripts.src).on('change', browserSync.reload);
	browserSync.watch(paths.images.src).on('change', browserSync.reload);
});

gulp.task('images', function() {
	return gulp.src(paths.images.src)
		.pipe(imagemin([
			imageminMozjpeg({
				quality: 80
			}),
			imageminGifsicle({
				optimizationLevel: 3,
				interlaced: true
			}),
			imageminOptipng({
				optimizationLevel: 2,
			}),
		]))
		.pipe(gulp.dest(paths.images.dest));
});

//переносим шрифты

gulp.task('fonts', function() {
	return gulp.src(paths.fonts.src)
		.pipe(gulp.dest(paths.fonts.dest));
});

gulp.task('spritessvg', function() {
	return gulp.src(paths.svgsprite.src)
	.pipe(svgSprite(
		config = {
			mode: {
				css: true,
				inline: true,
				symbol: true
			}
		}
	))
	.pipe(gulp.dest(paths.svgsprite.dest));
});

/* exports.styles = styles;
exports.clean = clean;
exports.images = images; */

gulp.task('watch', gulp.series(
	gulp.parallel('change', 'server')
))

gulp.task('default', gulp.series(
	'clean',
	gulp.parallel('styles', 'templates', 'images', 'spritessvg', 'fonts', 'scripts')
));
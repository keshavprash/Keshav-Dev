/*!
 * Keshav Prashar — Portfolio
 * Vanilla JS. No dependencies.
 */
(function () {
	'use strict';

	var doc = document;
	var root = doc.documentElement;
	var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
	var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------------------------------------------------------------- Theme */
	var THEME_KEY = 'kp-theme';

	function storeGet(key) {
		try { return window.localStorage.getItem(key); } catch (e) { return null; }
	}
	function storeSet(key, val) {
		try { window.localStorage.setItem(key, val); } catch (e) { /* ignore */ }
	}

	/* ------------------------------------------------------------ Tracking */
	// Conversion signals, emitted in two forms and depending on neither:
	//   * a dataLayer push, picked up by Google Tag Manager if it is ever installed
	//   * a DOM CustomEvent, for anything else that wants to listen
	// Nothing here loads a third-party script or carries an account id, so the
	// site behaves identically whether or not analytics is ever added.
	function track(name, detail) {
		var payload = detail || {};
		try {
			if (window.dataLayer && typeof window.dataLayer.push === 'function') {
				var d = { event: name };
				for (var k in payload) { if (Object.prototype.hasOwnProperty.call(payload, k)) d[k] = payload[k]; }
				window.dataLayer.push(d);
			}
		} catch (e) { /* analytics must never break the page */ }
		try {
			doc.dispatchEvent(new CustomEvent('kp:' + name, { detail: payload }));
		} catch (e) { /* older browsers: the dataLayer push above still ran */ }
	}

	// Every outbound contact route is tagged in the markup with data-cta, so a
	// tag manager can bind to it by selector without this file changing again.
	doc.addEventListener('click', function (e) {
		var el = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
		if (!el) return;
		track('contact_click', {
			method: el.getAttribute('data-cta'),
			location: el.getAttribute('data-cta-location') || 'page',
			page: location.pathname
		});
	});

	function applyTheme(theme) {
		root.setAttribute('data-theme', theme);
		var btn = $('.theme-toggle');
		if (btn) {
			btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
		}
		var meta = $('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0d11' : '#ffffff');
	}

	applyTheme(root.getAttribute('data-theme') || 'dark');

	var themeToggle = $('.theme-toggle');
	if (themeToggle) {
		themeToggle.addEventListener('click', function () {
			var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
			applyTheme(next);
			storeSet(THEME_KEY, next);
		});
	}

	/* ----------------------------------------------------------- Header UI */
	var header = $('.site-header');
	var toTop = $('.to-top');

	function onScroll() {
		var y = window.scrollY || window.pageYOffset;
		if (header) header.classList.toggle('is-stuck', y > 12);
		if (toTop) toTop.classList.toggle('is-visible', y > 700);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	if (toTop) {
		toTop.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
		});
	}

	/* ---------------------------------------------------------- Mobile menu */
	var navToggle = $('.nav-toggle');
	var mobileMenu = $('.mobile-menu');

	function setMenu(open) {
		if (!mobileMenu || !navToggle) return;
		mobileMenu.classList.toggle('is-open', open);
		if (header) header.classList.toggle('is-menu-open', open);
		navToggle.setAttribute('aria-expanded', String(open));
		navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		doc.body.classList.toggle('menu-open', open);
		doc.body.style.overflow = open ? 'hidden' : '';
	}

	if (navToggle && mobileMenu) {
		navToggle.addEventListener('click', function () {
			setMenu(!mobileMenu.classList.contains('is-open'));
		});
		$$('a, button', mobileMenu).forEach(function (el) {
			el.addEventListener('click', function () { setMenu(false); });
		});
		doc.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setMenu(false);
		});
		window.addEventListener('resize', function () {
			if (window.innerWidth > 900) setMenu(false);
		});
	}

	/* ------------------------------------------------------ Reveal on scroll */
	var revealables = $$('[data-reveal]');
	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealables.forEach(function (el) { el.classList.add('is-in'); });
	} else {
		var revealObserver = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var el = entry.target;
				var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
				setTimeout(function () { el.classList.add('is-in'); }, delay);
				revealObserver.unobserve(el);
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
		revealables.forEach(function (el) { revealObserver.observe(el); });
	}

	/* ------------------------------------------------------------- Counters */
	var counters = $$('[data-count]');
	if (counters.length) {
		var runCount = function (el) {
			var target = parseFloat(el.getAttribute('data-count'));
			if (reduceMotion) { el.textContent = String(target); return; }
			var dur = 1100;
			var start = null;
			var step = function (ts) {
				if (start === null) start = ts;
				var p = Math.min((ts - start) / dur, 1);
				var eased = 1 - Math.pow(1 - p, 3);
				el.textContent = String(Math.round(target * eased));
				if (p < 1) requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		};

		if (!('IntersectionObserver' in window)) {
			counters.forEach(runCount);
		} else {
			var countObserver = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					runCount(entry.target);
					countObserver.unobserve(entry.target);
				});
			}, { threshold: 0.4 });
			counters.forEach(function (el) { countObserver.observe(el); });
		}
	}

	/* ------------------------------------------------------------- Scrollspy */
	var navLinks = $$('.nav-links a[href^="#"]');
	var sections = navLinks
		.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); })
		.filter(Boolean);

	if (sections.length && 'IntersectionObserver' in window) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				navLinks.forEach(function (a) {
					a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
				});
			});
		}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
		sections.forEach(function (s) { spy.observe(s); });
	}

	/* --------------------------------------------------------- Role rotator */
	var rotator = $('[data-rotate]');
	if (rotator) {
		var words;
		try { words = JSON.parse(rotator.getAttribute('data-rotate')); } catch (e) { words = []; }
		if (words.length && !reduceMotion) {
			var wi = 0, ci = 0, deleting = false;
			var tick = function () {
				var word = words[wi];
				ci = deleting ? ci - 1 : ci + 1;
				rotator.textContent = word.slice(0, ci);
				var delay = deleting ? 45 : 85;
				if (!deleting && ci === word.length) { deleting = true; delay = 1900; }
				else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 320; }
				setTimeout(tick, delay);
			};
			setTimeout(tick, 700);
		} else if (words.length) {
			rotator.textContent = words[0];
		}
	}

	/* ------------------------------------------------------- Contact form */
	var form = $('#quote-form');
	if (form) {
		var status = $('#form-status');
		var EMAIL = form.getAttribute('data-email') || '';

		// One reading of the form, shared by the email and WhatsApp routes, so the
		// visitor never loses what they typed by choosing the other channel.
		var readBrief = function () {
			var data = new FormData(form);
			var get = function (k) { return String(data.get(k) || '').trim(); };
			return {
				name: get('name'), email: get('email'), phone: get('phone'),
				company: get('company'), website: get('website'),
				type: get('projectType'), budget: get('budget'),
				timeline: get('timeline'), contact: get('contactMethod'),
				message: get('message')
			};
		};

		var briefLines = function (b) {
			return [
				'Name: ' + b.name,
				'Email: ' + b.email,
				'Phone / WhatsApp: ' + (b.phone || 'Not provided'),
				'Company / business: ' + (b.company || 'Not provided'),
				'Current website: ' + (b.website || 'Not provided'),
				'Project type: ' + (b.type || 'Not specified'),
				'Budget range: ' + (b.budget || 'Not specified'),
				'Timeline: ' + (b.timeline || 'Not specified'),
				'Preferred reply: ' + (b.contact || 'Email'),
				'',
				'Project details:',
				b.message
			];
		};

		var say = function (msg, tone) {
			if (!status) return;
			status.textContent = msg;
			status.classList.add('is-visible');
			status.classList.toggle('is-error', tone === 'error');
			status.classList.toggle('is-ok', tone === 'ok');
		};

		var mailtoFallback = function (brief) {
			var subject = 'Project enquiry' + (brief.type ? ' — ' + brief.type : '') + (brief.name ? ' (' + brief.name + ')' : '');
			window.location.href = 'mailto:' + EMAIL +
				'?subject=' + encodeURIComponent(subject) +
				'&body=' + encodeURIComponent(briefLines(brief).join('\n'));
			say('Opening your email app with the message ready to send. If nothing opens, email ' + EMAIL + ' directly or message on WhatsApp.');
		};

		// Counted once per page view: how many people start the form vs. finish it.
		var formStarted = false;
		var onFormStart = function () {
			if (formStarted) return;
			formStarted = true;
			track('form_start', { page: location.pathname });
		};
		form.addEventListener('input', onFormStart);
		form.addEventListener('change', onFormStart);

		form.addEventListener('submit', function (e) {
			e.preventDefault();

			var brief = readBrief();
			// Set data-endpoint on the form to a form-to-email service (Formspree,
			// Web3Forms, Basin) and enquiries post straight through, giving a real
			// thank-you state and a conversion that can be counted. Left empty, the
			// form keeps its original behaviour of composing the mail locally.
			var endpoint = (form.getAttribute('data-endpoint') || '').trim();

			if (!endpoint) {
				track('generate_lead', { method: 'email_client', project_type: brief.type || 'unspecified' });
				mailtoFallback(brief);
				return;
			}

			var submitBtn = form.querySelector('button[type="submit"]');
			if (submitBtn) submitBtn.disabled = true;
			say('Sending your enquiry…');

			fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
				body: JSON.stringify({
					name: brief.name, email: brief.email, phone: brief.phone,
					company: brief.company, website: brief.website,
					projectType: brief.type, budget: brief.budget, timeline: brief.timeline,
					contactMethod: brief.contact, message: brief.message,
					_subject: 'Project enquiry' + (brief.type ? ' — ' + brief.type : '') + (brief.name ? ' (' + brief.name + ')' : '')
				})
			}).then(function (res) {
				if (!res.ok) throw new Error('HTTP ' + res.status);
				form.reset();
				say('Thanks — your enquiry is with me. I reply with a plan and an estimate, usually within 24 hours. If it is urgent, WhatsApp is faster.', 'ok');
				track('generate_lead', { method: 'form', project_type: brief.type || 'unspecified', budget: brief.budget || 'unspecified' });
			}).catch(function () {
				// Never lose an enquiry to a failed request: hand it to the mail client.
				say('That did not send — opening your email app with the details instead, so nothing is lost.', 'error');
				setTimeout(function () { mailtoFallback(brief); }, 900);
				track('form_error', { project_type: brief.type || 'unspecified' });
			}).then(function () {
				if (submitBtn) submitBtn.disabled = false;
			});
		});

		// The WhatsApp button beside Submit: if anything has been filled in, send that
		// brief along instead of the generic greeting. Falls back to the static href.
		var waBtn = form.querySelector('a.btn--wa');
		if (waBtn) {
			var waBase = waBtn.getAttribute('href').split('?')[0];
			waBtn.addEventListener('click', function () {
				var b = readBrief();
				if (!b.name && !b.message && !b.type) return;   // nothing typed — keep the default text
				var intro = 'Hi Keshav, I would like to discuss a project.';
				var text = intro + '\n\n' + briefLines(b).join('\n');
				waBtn.setAttribute('href', waBase + '?text=' + encodeURIComponent(text));
			});
		}

		// Prefill the project type when a service card CTA is used.
		$$('[data-service]').forEach(function (link) {
			link.addEventListener('click', function () {
				var select = form.querySelector('[name="projectType"]');
				if (!select) return;
				var value = link.getAttribute('data-service');
				Array.prototype.forEach.call(select.options, function (opt) {
					if (opt.value === value) select.value = value;
				});
			});
		});
	}


	/* --------------------------------------------------- Sticky mobile bar */
	// The bar's "Get a Free Quote" is redundant once the form itself is visible,
	// so it slides away while #contact is on screen. Pages without a contact
	// section (the guides) keep the bar throughout.
	var mobileCta = $('.mobile-cta');
	var contactSection = $('#contact');
	if (mobileCta && contactSection && 'IntersectionObserver' in window) {
		var ctaSpy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				mobileCta.classList.toggle('is-hidden', entry.isIntersecting);
			});
		}, { threshold: 0.15 });
		ctaSpy.observe(contactSection);
	}

	/* ------------------------------------------------------- Project modal */
	var IMG = 'images/projects/';

	var PROJECTS = {
		'ai-interview': {
			kicker: 'Flagship project · Full stack',
			title: 'AI Interview Preparation Platform',
			lead: 'A MERN workspace that turns scattered interview prep — resume checks, practice questions, coding practice — into one place where progress is measured and feedback is automatic.',
			goal: [
				'Candidates preparing for developer roles juggle a resume they are not sure passes an ATS filter, question banks with no feedback, and coding practice that lives somewhere else entirely. Nothing is scored, so nobody knows what to fix next.',
				'This platform puts the whole loop in one product: upload a resume and get an ATS-style breakdown, sit an AI mock interview, take a timed coding assessment, and read a scored report that says exactly which competency is holding you back. An admin side keeps the question banks, roles and companies behind it up to date.'
			],
			features: [
				'Resume upload with PDF parsing and ATS-style scoring, matched skills and missing keywords.',
				'AI mock interview sessions: question flow, answer submission, AI feedback and scored reports.',
				'Coding assessments wired to a code-execution service, with an offline fallback path.',
				'Performance analytics across technical, communication and problem-solving scores.',
				'Real-time, authenticated notifications over Socket.IO.',
				'Admin console for users, categories, exams, roles, companies and linked question banks.',
				'JWT authentication with HTTP-only cookies and role-based protected REST APIs.'
			],
			implementation: [
				'The front end is React 19 on Vite, with Redux Toolkit holding session, interview and assessment state and Tailwind CSS for the interface. Routes are split by role, so the candidate workspace and the admin console are separate protected areas of the same app.',
				'The back end is Node.js and Express with MongoDB and Mongoose. Authentication issues a JWT as an HTTP-only cookie, every write endpoint sits behind role-checked middleware, and Socket.IO carries authenticated notifications to the session that owns them.',
				'AI scoring, resume parsing and code execution each run through their own service layer. When one of them is unavailable the request falls back rather than failing — an assessment still runs offline, and the app degrades instead of breaking.'
			],
			demonstrates: [
				'Complex React architecture split across two role-based product areas.',
				'State management at scale with Redux Toolkit.',
				'REST API design, validation and role-protected endpoints.',
				'Authentication with JWT and HTTP-only cookies.',
				'Real-time communication with Socket.IO.',
				'AI API integration with graceful fallbacks.',
				'Dashboard, charting and reporting interfaces.',
				'End-to-end full-stack delivery, front end through database.'
			],
			role: 'Sole developer — product scope, React front end, Node.js and Express API, MongoDB schema, the AI service layer with its fallbacks, Socket.IO notifications and the admin console.',
			tech: ['MERN', 'React 19', 'Vite', 'Redux Toolkit', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'JWT', 'Socket.IO', 'AI APIs'],
			source: 'https://github.com/keshavprash/AI-Interview-Preparation-Platform',
			note: 'These images are UI previews I built from the project’s own feature set and source code. They are not screenshots of a hosted deployment — the platform runs locally and is not currently deployed publicly.',
			dir: 'ai-interview',
			shots: [
				['dashboard', 'Candidate dashboard', 'Preparation score, ATS resume score, mock interview and coding progress, performance trend and recent interview reports.'],
				['ats-analysis', 'Resume ATS analysis', 'Parsed resume, ATS compatibility score, section-by-section breakdown, matched skills, missing keywords and AI suggestions.'],
				['mock-interview', 'AI mock interview', 'Live question, timer, answer area, submit action, AI feedback on the previous answer and the full question flow.'],
				['feedback-report', 'AI feedback & scored report', 'Overall score with competency breakdown, strengths, weaknesses, an AI improvement plan and a question-by-question review.'],
				['coding-assessment', 'Coding assessment', 'Problem statement, code editor with language selector, test cases, run and submit actions, and the accepted result with runtime.'],
				['analytics', 'Performance analytics', 'Overall, technical, communication and problem-solving scores, score progression, accuracy by topic and ranked improvement areas.'],
				['admin', 'Admin console', 'Users, questions, categories, exams, roles and companies, with the paginated question bank and audit log.']
			]
		},

		'employee-task': {
			kicker: 'Full stack · Role-based',
			title: 'Employee Task Management System',
			lead: 'An internal employee management and task tracking application: administrators manage employees and tasks, employees update progress and log the work they did.',
			goal: [
				'Small teams lose track of work in spreadsheets and chat threads. Nobody can answer who is on what, what is overdue, or how long a task actually took — and there is no record once it is done.',
				'This is the internal tool that answers those questions. Admins create employees and tasks, assign them and watch the dashboard; employees see only their own queue, move tasks along and log the work behind each one. Every change is written to a history, so the record survives the conversation.'
			],
			features: [
				'JWT authentication with BCrypt password hashing and role-based access for admin and employee.',
				'Admin CRUD for employees and tasks, plus work-log views and dashboard metrics.',
				'Employee view for assigned tasks, status updates, work notes and task history.',
				'Paginated, sortable and searchable APIs with request validation and global error handling.',
				'Responsive React UI with charts, notifications, dialogs and protected routes.',
				'Swagger-documented REST endpoints.'
			],
			implementation: [
				'The API is Spring Boot 3 on Java 21 with PostgreSQL behind it. Passwords are stored with BCrypt, access is issued as a JWT, and roles are enforced at the endpoint so an employee request can never reach an admin route.',
				'List endpoints are paginated, sortable and searchable on the server, so the tables stay fast as the data grows. Requests are validated on the way in and a global exception handler turns anything that fails into a consistent error response instead of a stack trace.',
				'The front end is React 18 with Material UI: protected routes per role, dialogs for create and edit, charts on the dashboard, and notifications on the actions that change state. Every endpoint is documented with Swagger.'
			],
			demonstrates: [
				'Java and Spring Boot REST API design.',
				'Relational schema design on PostgreSQL.',
				'Secure authentication: JWT, BCrypt and role-based authorisation.',
				'Server-side pagination, sorting, searching and validation.',
				'React and Material UI interfaces with protected routes.',
				'Dashboard metrics, charts and audit history.',
				'API documentation with Swagger.'
			],
			role: 'Sole developer — Spring Boot REST API, PostgreSQL schema, JWT and BCrypt security, the React and Material UI front end, and the Swagger documentation.',
			tech: ['Spring Boot 3', 'Java 21', 'PostgreSQL', 'React 18', 'Material UI', 'JWT', 'BCrypt', 'Swagger'],
			source: 'https://github.com/keshavprash/employee-task-management',
			note: 'These images are UI previews I built from the project’s own feature set and source code. They are not screenshots of a hosted deployment — the application runs locally and is not currently deployed publicly.',
			dir: 'employee-task',
			shots: [
				['dashboard', 'Admin dashboard', 'Total employees, active, completed and pending tasks, throughput chart, task status breakdown, employee activity and notifications.'],
				['employees', 'Employee management', 'The employee table with search, department and role filters, status, active task counts, pagination and row actions.'],
				['tasks', 'Task management', 'The full task table with filters, priority, progress, work-log counts, bulk actions and server-side pagination.'],
				['task-details', 'Task details & work log', 'One task in full: description, assignee, due date, status controls, the work-log entries behind it and the audit history.'],
				['employee', 'Employee workspace', 'An employee’s own task queue, task detail, status updates and the work-log history behind a single task.']
			]
		},

		'space-shooter': {
			kicker: 'MERN · Canvas game',
			title: 'Space Shooter — MERN Platform',
			lead: 'A browser-based space shooter built with React on the front end and a MERN back end that stores player scores and rankings.',
			goal: [
				'A game is a hard test of front-end structure: state changes every frame, and it either stays smooth or it does not. I built this one to keep a real-time canvas loop inside a component-based React app without it turning into one giant file.',
				'The back end makes it a product rather than a toy. Finishing a run posts the score to an Express API, MongoDB stores it, and the leaderboard reads the ranking back — the same request path any small application needs.'
			],
			features: [
				'Canvas-based gameplay built in React with Vite.',
				'Component-based game structure with custom hooks and shared utilities.',
				'Express and MongoDB back end serving score and leaderboard routes.',
				'Score storage and a ranked leaderboard read back from the API.',
				'Environment-driven configuration and a production build path.'
			],
			implementation: [
				'The game runs on an HTML canvas driven from React. Rendering, input and the wave logic are split into components, custom hooks and utility modules rather than a single loop, so each piece can be changed on its own.',
				'The server is Express with MongoDB. Score submission and leaderboard reads are separate routes over a Mongoose model, and configuration — the Mongo URI and the JWT secret — comes from the environment so the same build runs locally and in production.',
				'Vite handles the development server and the production build, with the client and server kept as separate deployable pieces.'
			],
			demonstrates: [
				'Real-time rendering and state on an HTML canvas.',
				'Structuring React with components, custom hooks and utilities.',
				'Express routing and MongoDB persistence with Mongoose.',
				'Client–server request flow and API integration.',
				'Environment-driven configuration and production builds.'
			],
			role: 'Sole developer — the canvas game loop and React component structure, the Express API, MongoDB persistence and the Vite build configuration.',
			tech: ['MERN', 'React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'HTML Canvas'],
			source: 'https://github.com/keshavprash/space-shooter-mern',
			note: 'These images are UI previews I built from the project’s own feature set and source code. They are not screenshots of a hosted deployment — the game runs locally and is not currently deployed publicly.',
			dir: 'space-shooter',
			shots: [
				['game', 'Gameplay', 'The canvas play area with the player ship, enemy waves, projectiles and explosions, plus the score, wave, shield and lives HUD.'],
				['start-screen', 'Start screen & controls', 'Game title, start action, the control keys, your best run and the live top-pilots panel before a run begins.'],
				['leaderboard', 'Leaderboard', 'Top pilots, your best run and the global ranking read back from the MongoDB-backed API.']
			]
		},

		'portfolio': {
			kicker: 'Front end · Performance',
			title: 'This Portfolio',
			lead: 'The site you are reading — a hand-written, dependency-free static site built to load fast on a phone on mobile data.',
			goal: [
				'A developer portfolio that loads slowly argues against itself. This one had to prove the point it makes: fast on a mid-range phone on mobile data, readable in both themes, and usable with a keyboard.',
				'So it is hand-written. No framework, no build step and nothing to install — semantic HTML, one stylesheet and one small script, deployed straight to GitHub Pages.'
			],
			features: [
				'Semantic HTML with JSON-LD Person schema, Open Graph and Twitter card metadata.',
				'One hand-written stylesheet built on CSS custom properties, Grid and Flexbox.',
				'Light and dark themes that respect prefers-color-scheme and persist the choice.',
				'IntersectionObserver reveals, scroll-spy and animated counters — no scroll-event thrash.',
				'A project gallery with thumbnails, previous/next, keyboard navigation and focus management.',
				'WebP images, lazy loading, skip link, visible focus rings and reduced-motion support.',
				'Continuous deployment to GitHub Pages via GitHub Actions.'
			],
			implementation: [
				'The only external request is the Inter webfont; everything else is served from the repository. Images are WebP with a JPEG fallback in a picture element, lazy-loaded below the fold and given explicit dimensions so nothing shifts as they arrive.',
				'The stylesheet is built on custom properties, so the light and dark themes are one set of variables rather than two stylesheets. Reveals and scroll-spy use IntersectionObserver instead of scroll handlers, and every animation is disabled under prefers-reduced-motion.',
				'The project modal is vanilla JavaScript: it traps focus, closes on Escape or a backdrop click, restores focus to the button that opened it, and moves the gallery with the arrow keys. GitHub Actions publishes the site on every push to main.'
			],
			demonstrates: [
				'Semantic, accessible HTML and keyboard-first interaction.',
				'Modern CSS: custom properties, Grid, Flexbox and theming.',
				'Vanilla JavaScript with no dependencies or build step.',
				'Performance work: WebP, lazy loading and layout-stable images.',
				'SEO and social metadata, including structured data.',
				'CI/CD with GitHub Actions and GitHub Pages.'
			],
			role: 'Sole developer — design, copy, HTML, CSS and JavaScript, SEO and structured data, and the GitHub Actions deployment.',
			tech: ['HTML5', 'CSS3', 'Vanilla JS', 'Accessibility', 'Responsive Design', 'GitHub Actions', 'GitHub Pages'],
			source: 'https://github.com/keshavprash/Keshav-Dev',
			live: 'https://keshavprash.github.io/Keshav-Dev/',
			note: 'These two images are actual screenshots of this site, captured at 1600 × 1000.',
			dir: 'portfolio',
			shots: [
				['portfolio-preview', 'Hero & stats', 'The hero section with the availability badge, headline, introduction and calls to action.'],
				['portfolio-work', 'Featured work', 'The projects section with the image-led project cards.']
			]
		}
	};

	var modal = $('#project-modal');

	if (modal) {
		var dialog = $('.pm-dialog', modal);
		var scroller = $('.pm-scroll', modal);
		var stageSrc = $('#pm-stage-src');
		var stageImg = $('#pm-stage-img');
		var stageCap = $('#pm-stage-cap');
		var stageCount = $('#pm-count');
		var thumbsBox = $('#pm-thumbs');
		var prevBtn = $('.pm-arrow--prev', modal);
		var nextBtn = $('.pm-arrow--next', modal);
		var lastFocused = null;
		var current = null;
		var index = 0;

		var el = function (tag, cls, text) {
			var n = doc.createElement(tag);
			if (cls) n.className = cls;
			if (text != null) n.textContent = text;
			return n;
		};

		var fillList = function (id, items) {
			var box = $(id);
			box.textContent = '';
			items.forEach(function (t) { box.appendChild(el('li', null, t)); });
		};

		var fillParas = function (id, paras) {
			var box = $(id);
			box.textContent = '';
			paras.forEach(function (p) { box.appendChild(el('p', null, p)); });
		};

		var showShot = function (project, i) {
			var shot = project.shots[i];
			if (!shot) return;
			index = i;
			var base = IMG + project.dir + '/' + shot[0];
			stageSrc.setAttribute('srcset', base + '.webp');
			stageImg.setAttribute('src', base + '.jpg');
			// the visible <figcaption> carries the description, so the image is decorative here
			stageImg.setAttribute('alt', '');
			stageCap.textContent = shot[1] + ' — ' + shot[2];
			if (stageCount) stageCount.textContent = (i + 1) + ' / ' + project.shots.length;

			var thumbs = $$('.pm-thumb', thumbsBox);
			thumbs.forEach(function (t, n) {
				var on = n === i;
				t.classList.toggle('is-active', on);
				t.setAttribute('aria-current', on ? 'true' : 'false');
			});
			// keep the active thumbnail in view inside its own scroller, never the page
			if (thumbs[i] && thumbs[i].scrollIntoView) {
				thumbs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
			}
		};

		var step = function (dir) {
			if (!current || current.shots.length < 2) return;
			showShot(current, (index + dir + current.shots.length) % current.shots.length);
		};

		var fill = function (key) {
			var p = PROJECTS[key];
			if (!p) return false;
			current = p;

			$('#pm-kicker').textContent = p.kicker;
			$('#pm-title').textContent = p.title;
			$('#pm-lead').textContent = p.lead;

			fillParas('#pm-goal', p.goal);
			fillList('#pm-features', p.features);
			fillParas('#pm-implementation', p.implementation);
			fillList('#pm-demonstrates', p.demonstrates);

			var roleEl = $('#pm-role');
			if (roleEl) roleEl.textContent = p.role || '';

			var tech = $('#pm-tech');
			tech.textContent = '';
			p.tech.forEach(function (t, i) { tech.appendChild(el('li', i === 0 ? 'tag tag--accent' : 'tag', t)); });

			var links = $('#pm-links');
			links.textContent = '';
			if (p.live) {
				var live = el('a', 'btn btn--primary btn--sm', 'Visit Live Site');
				live.href = p.live;
				live.target = '_blank';
				live.rel = 'noopener';
				links.appendChild(live);
			}
			var src = el('a', 'btn btn--solid btn--sm', 'View Source on GitHub');
			src.href = p.source;
			src.target = '_blank';
			src.rel = 'noopener';
			links.appendChild(src);

			var talk = el('a', 'btn btn--ghost btn--sm', 'Discuss a Similar Project');
			talk.href = '#contact';
			talk.setAttribute('data-close-modal', '');
			links.appendChild(talk);

			$('#pm-disclaimer').textContent = p.note;

			thumbsBox.textContent = '';
			p.shots.forEach(function (shot, i) {
				var b = el('button', 'pm-thumb');
				b.type = 'button';
				var pic = doc.createElement('picture');
				var s = doc.createElement('source');
				s.setAttribute('srcset', IMG + p.dir + '/' + shot[0] + '.webp');
				s.type = 'image/webp';
				var im = doc.createElement('img');
				im.alt = '';
				im.loading = 'lazy';
				im.decoding = 'async';
				im.width = 1600;
				im.height = 1000;
				pic.appendChild(s);
				pic.appendChild(im);
				// set src only once the <img> sits inside its <picture>, so the browser
				// picks the WebP source instead of starting — then aborting — a JPEG fetch
				im.src = IMG + p.dir + '/' + shot[0] + '.jpg';
				b.appendChild(pic);
				b.appendChild(el('span', null, shot[1]));
				b.setAttribute('aria-label', 'Show screen ' + (i + 1) + ': ' + shot[1]);
				b.addEventListener('click', function () { showShot(p, i); });
				thumbsBox.appendChild(b);
			});

			var many = p.shots.length > 1;
			thumbsBox.style.display = many ? '' : 'none';
			if (prevBtn) prevBtn.hidden = !many;
			if (nextBtn) nextBtn.hidden = !many;
			if (stageCount) stageCount.hidden = !many;

			showShot(p, 0);
			return true;
		};

		var focusables = function () {
			return $$('a[href], button:not([disabled])', dialog).filter(function (n) {
				return n.offsetWidth > 0 || n.offsetHeight > 0;
			});
		};

		var openModal = function (key, trigger) {
			if (!fill(key)) return;
			track('project_view', { project: key, page: location.pathname });
			lastFocused = trigger || doc.activeElement;
			modal.hidden = false;
			doc.body.classList.add('pm-open');
			if (scroller) scroller.scrollTop = 0;
			dialog.focus();
		};

		var closeModal = function () {
			if (modal.hidden) return;
			modal.hidden = true;
			doc.body.classList.remove('pm-open');
			if (lastFocused && lastFocused.focus) lastFocused.focus();
			lastFocused = null;
		};

		$$('[data-open-project]').forEach(function (btn) {
			btn.addEventListener('click', function () {
				openModal(btn.getAttribute('data-open-project'), btn);
			});
		});

		if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
		if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });

		modal.addEventListener('click', function (e) {
			var node = e.target;
			while (node && node !== modal) {
				if (node.hasAttribute && node.hasAttribute('data-close-modal')) { closeModal(); return; }
				node = node.parentNode;
			}
		});

		doc.addEventListener('keydown', function (e) {
			if (modal.hidden) return;

			if (e.key === 'Escape') { closeModal(); return; }

			if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
				step(e.key === 'ArrowRight' ? 1 : -1);
				e.preventDefault();
				return;
			}

			if (e.key === 'Tab') {
				var items = focusables();
				if (!items.length) return;
				var first = items[0], last = items[items.length - 1];
				if (e.shiftKey && (doc.activeElement === first || doc.activeElement === dialog)) {
					last.focus(); e.preventDefault();
				} else if (!e.shiftKey && doc.activeElement === last) {
					first.focus(); e.preventDefault();
				}
			}
		});

		// Swipe the gallery on touch devices.
		var touchX = null;
		var stage = $('.pm-stage', modal);
		if (stage) {
			stage.addEventListener('touchstart', function (e) {
				touchX = e.changedTouches[0].clientX;
			}, { passive: true });
			stage.addEventListener('touchend', function (e) {
				if (touchX === null) return;
				var dx = e.changedTouches[0].clientX - touchX;
				touchX = null;
				if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
			}, { passive: true });
		}
	}

	/* -------------------------------------------------------------- Footer */
	var yearEl = $('#year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// ─── AP.HAUS SHARED JS ───

// Intersection Observer for reveals + dithers
(function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .dither').forEach(function(el) {
    observer.observe(el);
  });
})();

// Pixel cursor follower
(function() {
  var dot = document.getElementById('cursor');
  if (!dot) return;
  var grid = 8;
  document.addEventListener('mousemove', function(e) {
    var x = Math.round(e.clientX / grid) * grid;
    var y = Math.round(e.clientY / grid) * grid;
    dot.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
  });
})();

// Drifting pixel particle field
(function() {
  var canvas = document.getElementById('field');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var GRID = 4;
  var COUNT = 80;
  var mx = -9999, my = -9999;

  document.addEventListener('mousemove', function(e) { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', function() { mx = -9999; my = -9999; });

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
  }

  function seed() {
    particles = [];
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.12,
        size: Math.random() > 0.7 ? 3 : 2,
        alpha: Math.random() * 0.18 + 0.04,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.002 + 0.001
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    var w = window.innerWidth;
    var h = window.innerHeight;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var dx = p.x - mx, dy = p.y - my;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120 && dist > 0) {
        var force = (120 - dist) / 120 * 0.8;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      p.x += p.vx + Math.sin(t * p.drift + p.phase) * 0.08;
      p.y += p.vy + Math.cos(t * p.drift * 0.7 + p.phase) * 0.06;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      var sx = Math.round(p.x / GRID) * GRID;
      var sy = Math.round(p.y / GRID) * GRID;
      var a = p.alpha * (0.6 + 0.4 * Math.sin(t * 0.001 + p.phase));

      ctx.fillStyle = 'rgba(90, 78, 65, ' + a + ')';
      ctx.fillRect(sx, sy, p.size, p.size);
    }

    requestAnimationFrame(draw);
  }

  resize();
  seed();
  requestAnimationFrame(draw);
  window.addEventListener('resize', function() {
    resize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  });
})();

// Nav scroll state
(function() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function check() {
    var y = window.scrollY;
    if (y > 60 && !nav.classList.contains('scrolled')) nav.classList.add('scrolled');
    else if (y <= 60 && nav.classList.contains('scrolled')) nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', check, { passive: true });
})();

// Per-letter hero title (home page only)
(function() {
  var title = document.getElementById('hero-title');
  if (!title) return;
  var text = 'AP.HAUS';
  text.split('').forEach(function(ch, i) {
    var span = document.createElement('span');
    span.textContent = ch;
    span.style.setProperty('--i', i);
    span.addEventListener('animationend', function() {
      if (this.style.animation || getComputedStyle(this).animationName === 'letter-in') {
        this.style.opacity = '1';
      }
    });
    span.addEventListener('mouseenter', function() {
      this.style.opacity = '1';
      this.style.animation = 'none';
      void this.offsetHeight;
      this.style.animation = 'letter-hop 350ms var(--ease-out-expo)';
    });
    title.appendChild(span);
  });
})();

// Research card index flicker on reveal
(function() {
  var cards = document.querySelectorAll('.research-card[data-idx]');
  if (!cards.length) return;
  var flickerObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var final = el.getAttribute('data-idx');
        var count = 0;
        var interval = setInterval(function() {
          el.setAttribute('data-idx', '0' + Math.floor(Math.random() * 10));
          count++;
          if (count > 6) {
            clearInterval(interval);
            el.setAttribute('data-idx', final);
          }
        }, 50);
        flickerObs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  cards.forEach(function(c) { flickerObs.observe(c); });
})();

// Fetch GitHub star counts
(function() {
  document.querySelectorAll('.star-count').forEach(function(el) {
    var repo = el.getAttribute('data-repo');
    fetch('https://api.github.com/repos/' + repo)
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.stargazers_count !== undefined) {
          el.textContent = d.stargazers_count + ' \u2605';
          el.classList.add('loaded');
        }
      })
      .catch(function() {});
  });
})();

// Smooth scroll for same-page anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var navLinks = document.querySelector('.nav-links');
      if (navLinks) navLinks.classList.remove('open');
    }
  });
});

// Mobile nav toggle
(function() {
  var toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('open');
  });
})();

// Posts listing: fetch posts.json and render cards
(function() {
  var grid = document.getElementById('posts-grid');
  if (!grid) return;

  fetch('/posts/posts.json')
    .then(function(r) { return r.json(); })
    .then(function(posts) {
      if (!posts.length) {
        grid.innerHTML = '<div class="posts-empty reveal visible"><p>No posts yet. Check back soon.</p></div>';
        return;
      }

      // sort by date descending
      posts.sort(function(a, b) { return b.date.localeCompare(a.date); });

      posts.forEach(function(post, i) {
        var card = document.createElement('a');
        card.href = '/posts/' + post.slug + '/';
        card.className = 'post-card reveal';
        card.style.setProperty('--s', i);

        var date = new Date(post.date + 'T00:00:00');
        var dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        var tags = '';
        if (post.tags && post.tags.length) {
          tags = '<div class="post-card-tags">' +
            post.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') +
            '</div>';
        }

        card.innerHTML =
          '<div class="post-card-date">' + dateStr + '</div>' +
          '<h3 class="post-card-title">' + post.title + '</h3>' +
          '<p class="post-card-desc">' + post.description + '</p>' +
          tags;

        grid.appendChild(card);
      });

      // observe newly added cards
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      grid.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
      });
    })
    .catch(function() {
      grid.innerHTML = '<div class="posts-empty reveal visible"><p>No posts yet. Check back soon.</p></div>';
    });
})();

// Latest posts on home page
(function() {
  var container = document.getElementById('latest-posts');
  if (!container) return;

  fetch('/posts/posts.json')
    .then(function(r) { return r.json(); })
    .then(function(posts) {
      if (!posts.length) return;

      posts.sort(function(a, b) { return b.date.localeCompare(a.date); });
      var latest = posts.slice(0, 3);

      latest.forEach(function(post, i) {
        var card = document.createElement('a');
        card.href = '/posts/' + post.slug + '/';
        card.className = 'post-card reveal';
        card.style.setProperty('--s', i);

        var date = new Date(post.date + 'T00:00:00');
        var dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        card.innerHTML =
          '<div class="post-card-date">' + dateStr + '</div>' +
          '<h3 class="post-card-title">' + post.title + '</h3>' +
          '<p class="post-card-desc">' + post.description + '</p>';

        container.appendChild(card);
      });

      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      container.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
      });
    })
    .catch(function() {});
})();

// Konami code -> pixel rain
(function() {
  var seq = [38,38,40,40,37,39,37,39,66,65];
  var pos = 0;
  document.addEventListener('keydown', function(e) {
    if (e.keyCode === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        pixelRain();
      }
    } else {
      pos = 0;
    }
  });

  function pixelRain() {
    var c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:9998;pointer-events:none;';
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var cols = Math.floor(c.width / 12);
    var drops = [];
    var chars = 'APHAUS01'.split('');
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;

    var frames = 0;
    function fall() {
      ctx.fillStyle = 'rgba(245, 241, 235, 0.08)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = '10px Silkscreen, monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        var brightness = Math.random() * 0.4 + 0.1;
        ctx.fillStyle = 'rgba(90, 78, 65, ' + brightness + ')';
        ctx.fillText(ch, i * 12, drops[i] * 12);
        if (drops[i] * 12 > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      frames++;
      if (frames < 180) requestAnimationFrame(fall);
      else {
        var opacity = 1;
        function fadeOut() {
          opacity -= 0.03;
          c.style.opacity = opacity;
          if (opacity > 0) requestAnimationFrame(fadeOut);
          else c.remove();
        }
        fadeOut();
      }
    }
    fall();
  }
})();

// Console easter egg
console.log(
  '%c AP.HAUS ',
  'background:#3d3530;color:#f5f1eb;font-family:monospace;font-size:20px;padding:8px 16px;'
);
console.log(
  '%cAI research that ships as products.\n%chttps://github.com/Divagation',
  'color:#5a4e41;font-family:monospace;font-size:12px;',
  'color:#8a7a6a;font-family:monospace;font-size:11px;'
);

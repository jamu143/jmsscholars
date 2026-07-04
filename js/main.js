document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var accordions = document.querySelectorAll('.faq-item');
  accordions.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      accordions.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  var togglePills = document.querySelectorAll('.toggle-pill');
  togglePills.forEach(function (pill) {
    var buttons = pill.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = document.querySelector(pill.dataset.target);
        if (target) {
          if (btn.dataset.mode === 'cf') {
            target.classList.add('show-cf');
            target.classList.remove('show-ca');
          } else {
            target.classList.add('show-ca');
            target.classList.remove('show-cf');
          }
        }
      });
    });
  });

  // Courses page: year + course dual-toggle
  var yearPill = document.getElementById('year-pill');
  var coursePick = document.getElementById('course-pick');
  if (yearPill && coursePick) {
    var currentYear = '11';
    var currentCourse = 'specialist';

    function updateCourseBlocks() {
      document.querySelectorAll('.course-block').forEach(function (block) {
        var match = block.dataset.year === currentYear && block.dataset.course === currentCourse;
        block.classList.toggle('active', match);
      });
    }

    yearPill.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        yearPill.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentYear = btn.dataset.year;
        updateCourseBlocks();
      });
    });

    coursePick.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        coursePick.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCourse = btn.dataset.course;
        updateCourseBlocks();
      });
    });
  }
});

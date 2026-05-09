'use strict';

window.Router = {
  _routes: [],

  init() {
    this._routes = [
      {
        pattern: /^(#\/?)?$/,
        handler: () => window.Pages.list.render(),
      },
      {
        pattern: /^#\/recipes\/new$/,
        handler: () => window.Pages.new.render(),
      },
      {
        pattern: /^#\/recipes\/(\d+)\/edit$/,
        handler: (m) => window.Pages.edit.render(Number(m[1])),
      },
      {
        pattern: /^#\/recipes\/(\d+)$/,
        handler: (m) => window.Pages.detail.render(Number(m[1])),
      },
    ];
    window.addEventListener('hashchange', () => this._route());
    this._route();
  },

  navigate(hash) {
    if (location.hash === hash) {
      this._route();
    } else {
      location.hash = hash;
    }
  },

  _route() {
    const hash = location.hash || '';
    for (var i = 0; i < this._routes.length; i++) {
      var m = hash.match(this._routes[i].pattern);
      if (m) {
        this._routes[i].handler(m);
        window.scrollTo(0, 0);
        return;
      }
    }
    window.Pages.list.render();
    window.scrollTo(0, 0);
  },
};

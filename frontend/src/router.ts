type Route = {
	path: string;
	view: () => string;
  };

export class Router {
  private routes: Route[];
  private root: HTMLElement;

  constructor(routes: Route[], rootSelector: string) {
    this.routes = routes;
    const root = document.querySelector(rootSelector);
    if (!root) throw new Error(`Root element ${rootSelector} not found`);
    if (root instanceof HTMLElement) {
		this.root = root;
	  } else {
		throw new Error('root must be an HTMLElement');
	  }
    this.init();
  }

  private navigate(path: string) {
    history.pushState({}, "", path);
    this.render(path);
  }

  private matchRoute(path: string): Route | undefined {
    return this.routes.find((r) => r.path === path);
  }

  private render(path: string) {
    const route = this.matchRoute(path) ?? this.routes.find(r => r.path === "*");
    if (route) this.root.innerHTML = route.view();
  }

  private init() {
    // Handle link clicks
    document.body.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.matches("[data-link]")) {
        e.preventDefault();
        const href = (target as HTMLAnchorElement).getAttribute("href");
        if (href) this.navigate(href);
      }
    });

    // Handle back/forward
    window.addEventListener("popstate", () => this.render(location.pathname));

    // Initial render
    this.render(location.pathname);
  }
}
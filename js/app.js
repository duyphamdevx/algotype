// Master Application Controller & Router
// Clean Vanilla ES Modules architecture

import { store } from './store.js';
import { renderTodayView } from './views/today.js';
import { renderPracticeView } from './views/practice.js';
import { renderProblemsView } from './views/problems.js';
import { renderMockView } from './views/mock.js';
import { renderFormulasView } from './views/formulas.js';
import { renderMistakesView } from './views/mistakes.js';
import { renderVariantsView } from './views/variants.js';
import { renderStatsView } from './views/stats.js';

class App {
  constructor() {
    this.currentView = 'today';
    this.viewParams = {};
    this.mainContainer = document.getElementById('main-content');
    this.init();
  }

  init() {
    this.bindNavigation();
    this.bindShortcutsModal();
    this.updateBadges();

    store.subscribe(() => {
      this.updateBadges();
    });

    this.renderCurrentView();
  }

  bindNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.navigate(targetView);
      });
    });
  }

  bindShortcutsModal() {
    const modal = document.getElementById('modal-shortcuts');
    const openBtn = document.getElementById('btn-open-shortcuts');
    const closeBtn = document.getElementById('btn-close-shortcuts');
    const okBtn = document.getElementById('btn-ok-shortcuts');

    openBtn?.addEventListener('click', () => {
      modal?.classList.remove('hidden');
    });

    const hide = () => modal?.classList.add('hidden');
    closeBtn?.addEventListener('click', hide);
    okBtn?.addEventListener('click', hide);

    window.addEventListener('keydown', e => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        modal?.classList.toggle('hidden');
      }
    });
  }

  navigate(viewName, params = {}) {
    this.currentView = viewName;
    this.viewParams = params;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const v = btn.getAttribute('data-view');
      if (v === viewName) {
        btn.classList.add('active-nav-tab');
        btn.classList.remove('inactive-nav-tab');
      } else {
        btn.classList.remove('active-nav-tab');
        btn.classList.add('inactive-nav-tab');
      }
    });

    this.renderCurrentView();
  }

  updateBadges() {
    const dueAlgos = store.getDueAlgos().length;
    const dueNotes = store.getDueNotes().length;
    const totalDue = dueAlgos + dueNotes;

    const badgeToday = document.getElementById('badge-nav-today');
    if (badgeToday) {
      if (totalDue > 0) {
        badgeToday.textContent = totalDue;
        badgeToday.classList.remove('hidden');
      } else {
        badgeToday.classList.add('hidden');
      }
    }

    const badgeMock = document.getElementById('badge-nav-mock-live');
    if (badgeMock) {
      if (store.getActiveMock()) {
        badgeMock.classList.remove('hidden');
      } else {
        badgeMock.classList.add('hidden');
      }
    }
  }

  renderCurrentView() {
    if (!this.mainContainer) return;
    this.mainContainer.innerHTML = '';

    switch (this.currentView) {
      case 'today':
        renderTodayView(this.mainContainer, {
          onStartTyping: (algoId, mode) => {
            this.navigate('practice', { initialAlgoId: algoId, initialMode: mode });
          },
          onOpenProblem: problemId => {
            this.navigate('problems', { openProblemId: problemId });
          }
        });
        break;

      case 'practice':
        renderPracticeView(this.mainContainer, {
          initialAlgoId: this.viewParams.initialAlgoId,
          initialMode: this.viewParams.initialMode || 'recall'
        });
        break;

      case 'problems':
        renderProblemsView(this.mainContainer, {
          onOpenAlgo: algoId => {
            this.navigate('practice', { initialAlgoId: algoId, initialMode: 'recall' });
          }
        });
        break;

      case 'mock':
        renderMockView(this.mainContainer);
        break;

      case 'formulas':
        renderFormulasView(this.mainContainer);
        break;

      case 'mistakes':
        renderMistakesView(this.mainContainer);
        break;

      case 'variants':
        renderVariantsView(this.mainContainer);
        break;

      case 'stats':
        renderStatsView(this.mainContainer);
        break;

      default:
        this.navigate('today');
        break;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

class Observable {
  // hold the subscribe function passed to us
  constructor(subscribe) {
    this._subscribe = subscribe;
  }
  subscribe(observer) {
    //call our subscribe with the observer obj
    this._subscribe(observer);
  }

  static fromEvent(dom, eventType) {
    return new Observable(observer => {
      const handler = e => observer.next(e);
      dom.addEventListener(eventType, handler);

      return {
        unsubscribe() {
          dom.removeEventListener(eventType, handler);
        },
      };
    });
  }
}

// TEST
// const div = document.querySelector('div');
//
// const divClicks = Observable.fromEvent(div, click);
// divClicks.subscribe({
//   next(e) {
//     console.log(e);
//   },
// });

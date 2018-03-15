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

  map(projectionFunc) {
    return new Observable(observer => {
      const subscription = this.subscribe({
        next(value) {
          // catches errors from the projectionFunc if any
          try {
            observer.next(projectionFunc(value));
          } catch (err) {
            observer.error(err);
            subscription.unsubscribe();
          }
        },
        error(err) {
          observer.error(err);
        },
        completed() {
          observer.completed();
        },
      });
      //return a reference to our subscription so that the observable that uses
      // map is able to unsubscribe directly from the source observable
      return subscription;
    });
  }
}
//
// TEST;
//
// const div = document.querySelector('div');
//
// const divClicks = Observable.fromEvent(div, click);
// divClicks
//   .map(e => e.clientX)
//   .filter(clientX => clientX > 50)
//   .subscribe({
//     next(data) {
//       console.log(data);
//     },
//     error(err) {
//       console.log('there was an err');
//     },
//     completed() {
//       console.log('completed');
//     },
//   });

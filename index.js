class Observable {
  // hold the subscribe function passed to us
  constructor(subscribe) {
    this._subscribe = subscribe;
  }
  subscribe(observer) {
    //call our subscribe with the observer obj
    return this._subscribe(observer);
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

  filter(predicateFunc) {
    return new Observable(observer => {
      const subscription = this.subscribe({
        next(value) {
          // catches errors from the predicateFunc if any
          try {
            if (predicateFunc(value)) {
              observer.next(value);
            }
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
      return subscription;
    });
  }

  //concat two cold observables
  static concat(...observables) {
    return new Observable(observer => {
      //Make a copy of the observables array
      const observablesCopy = observables.slice();

      // Variable to hold the currentSubscription, this will be returned
      let currentSubscription = null;
      const processNextObservable = () => {
        // Any number of observables is acceptable
        // Pop one out and subscribe to it
        const currentObservable = observablesCopy.shift();

        currentSubscription = currentObservable.subscribe({
          next(value) {
            observer.next(value);
          },
          error(err) {
            observer.error(err);
            currentSubscription.unsubscribe();
          },
          completed() {
            // if there are no more observables to iterate through than we are done
            if (observablesToConcat.length === 0) {
              observer.completed();
              currentSubscription.unsubscribe();
            } else {
              // there are more observables recursively do the same
              processNextObservable();
            }
          },
        });
      };
      //Begin processing the passed in observables
      processNextObservable();
      return {
        unsubscribe() {
          currentSubscription.unsubscribe();
        },
      };
    });
  }
}

//
// TEST;
//
// const div = document.querySelector('div');
//
// const divClicks = Observable.fromEvent(div, "click");
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

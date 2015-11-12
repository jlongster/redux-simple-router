
// constants

const UPDATE_PATH = "@@router/UPDATE_PATH";

// Action creator

function updatePath(path, noRouterUpdate) {
  return {
    type: UPDATE_PATH,
    path: path,
    noRouterUpdate: noRouterUpdate
  }
}

// Reducer

const initialState = typeof window === undefined ? {} : {
  path: locationToString(window.location)
};

function update(state=initialState, action) {
  if(action.type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: action.path,
      noRouterUpdate: action.noRouterUpdate
    });
  }
  return state;
}

// Syncing

function locationToString(location) {
  const regex = /\/#(\/[^\?]*)/.exec(location.href);
  if( regex!==null && typeof regex[1] !== 'undefined') return regex[1];
  else return location.pathname;
}

function syncReduxAndRouter(history, store) {
  if(!store.getState().routing) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the reducer under the name `routing`?"
    );
  }

  history.listen(location => {
    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anthing if the location is the same
    if(store.getState().routing.path !== locationToString(location)) {
      store.dispatch(updatePath(locationToString(location)));
    }
  });

  store.subscribe(() => {
    const routing = store.getState().routing;
    // Don't update the router if nothing has changed. The
    // `noRouterUpdate` flag can be set to avoid updating altogether,
    // which is useful for things like loading snapshots or very special
    // edge cases.
    if(routing.path !== locationToString(window.location) &&
       !routing.noRouterUpdate) {
      history.pushState(null, routing.path);
    }
  });
}

module.exports = {
  UPDATE_PATH,
  updatePath,
  syncReduxAndRouter,
  routeReducer: update,
};

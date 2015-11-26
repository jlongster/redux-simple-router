
// constants

const UPDATE_PATH = "@@router/UPDATE_PATH";
const SELECT_STATE = state => state.routing;

// Action creator

function updatePath(path, avoidRouterUpdate) {
  return {
    type: UPDATE_PATH,
    path: path,
    avoidRouterUpdate: !!avoidRouterUpdate
  }
}

// Reducer

const initialState = {
  changeId: 1,
  path: (typeof window !== 'undefined') ?
    locationToString(window.location) :
    '/'
};

function update(state=initialState, action) {
  if(action.type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: action.path,
      changeId: state.changeId + (action.avoidRouterUpdate ? 0 : 1)
    });
  }
  return state;
}

// Syncing

function locationToString(location) {
  return location.pathname + location.search + location.hash;
}

function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
  const getRouterState = () => selectRouterState(store.getState());
  let lastChangeId = 0;

  if(!getRouterState()) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the routing reducer?"
    );
  }

  const unsubscribeHistory = history.listen(location => {
    const routePath = locationToString(location);

    // Avoid dispatching an action if the store is already up-to-date
    if(getRouterState().path !== routePath) {
      store.dispatch(updatePath(routePath, true));
    }
  });

  const unsubscribeStore = store.subscribe(() => {
    const routing = getRouterState();

    // Only update the router once per `updatePath` call. This is
    // indicated by the `changeId` state; when that number changes, we
    // should call `pushState`.
    if(lastChangeId !== routing.changeId) {
      lastChangeId = routing.changeId;
      history.pushState(null, routing.path);
    }
  });

  return function unsubscribe() {
    unsubscribeHistory();
    unsubscribeStore();
  };
}

module.exports = {
  UPDATE_PATH,
  updatePath,
  syncReduxAndRouter,
  routeReducer: update
};

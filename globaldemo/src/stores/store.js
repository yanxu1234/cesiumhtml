// store.js

import Vuex from 'vuex';

const store = new Vuex.Store({
  state: {
    isCreatingMenuItem: -1,
  },
  mutations: {
    setIsCreatingMenuItem(state, value) {
      state.isCreatingMenuItem = value;
    },
  
  },
});
export default store;